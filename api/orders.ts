import { Router } from 'express';

const router = Router();

router.post('/create', (req, res) => {
  res.json({ message: 'Order created successfully', id: 'o1' });
});

router.get('/:user_id', (req, res) => {
  res.json([{ id: 'o1', status: 'pending', total: 100 }]);
});

router.get('/detail/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'pending', total: 100 });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  res.json({ message: `Order ${req.params.id} status updated to ${status}` });
});

export default router;
