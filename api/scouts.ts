import { Router } from 'express';

const router = Router();

// Places
router.post('/places/add', (req, res) => {
  res.json({ message: 'Place added successfully', id: 'p1' });
});

router.get('/places', (req, res) => {
  res.json([{ id: 'p1', name: 'Test Place' }]);
});

router.get('/places/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test Place' });
});

router.put('/places/:id', (req, res) => {
  res.json({ message: 'Place updated successfully', id: req.params.id });
});

router.post('/places/verify', (req, res) => {
  res.json({ message: 'Place verified successfully' });
});

// Tasks
router.post('/tasks/create', (req, res) => {
  res.json({ message: 'Task created successfully', id: 't1' });
});

router.get('/tasks', (req, res) => {
  res.json([{ id: 't1', title: 'Test Task' }]);
});

router.post('/tasks/submit', (req, res) => {
  res.json({ message: 'Task submitted successfully' });
});

router.get('/tasks/submissions', (req, res) => {
  res.json([{ id: 's1', taskId: 't1', status: 'pending' }]);
});

router.post('/tasks/approve', (req, res) => {
  res.json({ message: 'Task approved successfully' });
});

export default router;
