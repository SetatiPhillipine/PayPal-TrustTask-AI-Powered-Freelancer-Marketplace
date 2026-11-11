import { Router } from 'express';
import Project from '../models/Project.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const populate = (q) => q.populate('client', 'name').populate('freelancer', 'name');
const canView = (p, u) =>
  String(p.client._id || p.client) === String(u._id) ||
  (p.freelancer && String(p.freelancer._id || p.freelancer) === String(u._id)) ||
  (u.role === 'freelancer' && p.status === 'open');

router.post('/', requireRole('client'), async (req, res, next) => {
  try {
    const { title, description, summary, deliverables, milestones } = req.body;
    if (!title || !Array.isArray(milestones) || milestones.length === 0)
      return res.status(400).json({ error: 'A title and at least one milestone are required' });
    const clean = milestones.slice(0, 10).map((m) => ({
      title: String(m.title || '').slice(0, 120),
      description: String(m.description || '').slice(0, 500),
      amount: Math.max(0, Number(m.amount) || 0),
      dueInDays: Number(m.dueInDays) || 7,
    }));
    const project = await Project.create({
      client: req.user._id, title: String(title).slice(0, 120), description, summary,
      deliverables: (deliverables || []).slice(0, 10).map(String), milestones: clean,
    });
    res.status(201).json(project);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'client'
      ? { client: req.user._id }
      : { $or: [{ status: 'open' }, { freelancer: req.user._id }] };
    res.json(await populate(Project.find(filter).sort('-createdAt')));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await populate(Project.findById(req.params.id));
    if (!p || !canView(p, req.user)) return res.status(404).json({ error: 'Project not found' });
    res.json(p);
  } catch (e) { next(e); }
});

router.post('/:id/accept', requireRole('freelancer'), async (req, res, next) => {
  try {
    const p = await Project.findOneAndUpdate(
      { _id: req.params.id, status: 'open', freelancer: null },
      { freelancer: req.user._id, status: 'active' }, { new: true });
    if (!p) return res.status(409).json({ error: 'This project is no longer open' });
    res.json(await populate(Project.findById(p._id)));
  } catch (e) { next(e); }
});

// Freelancer: pending -> in_progress -> submitted. Client: submitted -> approved.
router.patch('/:id/milestones/:mid', async (req, res, next) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const m = p.milestones.id(req.params.mid);
    if (!m) return res.status(404).json({ error: 'Milestone not found' });
    const { status } = req.body;
    const isClient = String(p.client) === String(req.user._id);
    const isFreelancer = p.freelancer && String(p.freelancer) === String(req.user._id);
    const allowed =
      (isFreelancer && m.status === 'pending' && status === 'in_progress') ||
      (isFreelancer && m.status === 'in_progress' && status === 'submitted') ||
      (isClient && m.status === 'submitted' && status === 'approved');
    if (!allowed) return res.status(403).json({ error: 'That status change is not allowed' });
    m.status = status;
    if (p.milestones.every((x) => x.status === 'approved')) p.status = 'completed';
    await p.save();
    res.json(await populate(Project.findById(p._id)));
  } catch (e) { next(e); }
});

export default router;
