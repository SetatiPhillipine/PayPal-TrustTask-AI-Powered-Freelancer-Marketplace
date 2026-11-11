import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({ error: 'Name, email and a password of 8+ characters are required' });
    if (!['client', 'freelancer'].includes(role))
      return res.status(400).json({ error: 'Choose client or freelancer' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ error: 'That email is already registered' });
    const user = await User.create({ name, email, role, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
      return res.status(401).json({ error: 'Incorrect email or password' });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: pub(req.user) }));
export default router;
