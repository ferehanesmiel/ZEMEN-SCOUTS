import { Router } from 'express';

const router = Router();

router.post('/register', (req, res) => {
  res.json({ message: 'User registered successfully' });
});

router.post('/login', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { id: '1', name: 'Test User' } });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', (req, res) => {
  res.json({ id: '1', name: 'Test User', role: 'scout' });
});

export default router;
