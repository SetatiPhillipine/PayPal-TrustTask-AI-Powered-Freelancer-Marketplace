import { Router } from 'express';
import Project from '../models/Project.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createOrder, captureOrder } from '../services/paypal.js';

const router = Router();
router.use(requireAuth, requireRole('client'));

async function ownProject(id, user) {
  const p = await Project.findById(id);
  if (!p || String(p.client) !== String(user._id)) throw Object.assign(new Error('Project not found'), { status: 404 });
  return p;
}

// The amount is ALWAYS computed here on the server, never taken from the browser.
router.post('/create-order', async (req, res, next) => {
  try {
    const p = await ownProject(req.body.projectId, req.user);
    if (p.payment.status === 'paid') return res.status(409).json({ error: 'This project is already paid' });
    const amount = p.total;
    if (!(amount > 0)) return res.status(400).json({ error: 'Project total must be above zero' });
    
    // Pass the project ID as custom_id here
    const order = await createOrder({ amount, projectId: p._id, description: `TrustTask: ${p.title}` });
    p.payment = { status: 'pending', orderId: order.id, amount, currency: 'USD' };
    await p.save();
    res.json({ id: order.id });
  } catch (e) { next(e); }
});

// Verify with PayPal before marking anything as paid.
router.post('/capture-order', async (req, res, next) => {
  try {
    const p = await ownProject(req.body.projectId, req.user);
    if (p.payment.status === 'paid') return res.json(p);
    
    // 1. Verify the order ID matches what we saved
    if (!p.payment.orderId || p.payment.orderId !== req.body.orderId)
      return res.status(400).json({ error: 'Order does not match this project' });
      
    // 2. Ask PayPal to capture the money
    const result = await captureOrder(req.body.orderId);
    const unit = result.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    
    // 3. Verify the payment was actually completed and the amounts match
    const valid =
      result.status === 'COMPLETED' &&
      capture?.status === 'COMPLETED' &&
      Number(capture.amount.value) === Number(p.payment.amount.toFixed(2)) &&
      capture.amount.currency_code === 'USD';
      
    if (!valid) return res.status(402).json({ error: 'Payment could not be verified' });
    
    // 4. Mark as paid
    p.payment.status = 'paid';
    p.payment.captureId = capture.id;
    p.payment.paidAt = new Date();
    await p.save();
    res.json(p);
  } catch (e) { next(e); }
});

export default router;