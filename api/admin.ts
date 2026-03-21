import { Router } from 'express';

const router = Router();

router.get('/dashboard', (req, res) => {
  res.json({ totalUsers: 100, activeTasks: 50, totalShops: 20 });
});

router.get('/users', (req, res) => {
  res.json([{ id: '1', name: 'Test User', role: 'scout' }]);
});

router.get('/analytics', (req, res) => {
  res.json({ revenue: 10000, growth: 15 });
});

router.post('/approve-shop', (req, res) => {
  const { shop_id } = req.body;
  res.json({ message: `Shop ${shop_id} approved` });
});

router.post('/approve-place', (req, res) => {
  const { place_id } = req.body;
  res.json({ message: `Place ${place_id} approved` });
});

router.post('/manage-rewards', (req, res) => {
  const { action, amount } = req.body;
  res.json({ message: `Reward settings updated: ${action} ${amount}` });
});

export default router;
