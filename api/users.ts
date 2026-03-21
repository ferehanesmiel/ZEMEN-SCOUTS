import { Router } from 'express';

const router = Router();

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test User' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'User updated successfully', id: req.params.id });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'User deleted successfully', id: req.params.id });
});

export default router;
