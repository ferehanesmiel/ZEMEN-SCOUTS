import { Router } from 'express';

const router = Router();

router.post('/request', (req, res) => {
  res.json({ message: 'Delivery requested successfully', id: 'd1' });
});

router.get('/list', (req, res) => {
  res.json([{ id: 'd1', status: 'pending', destination: 'Test Location' }]);
});

router.post('/accept', (req, res) => {
  const { delivery_id, rider_id } = req.body;
  res.json({ message: `Delivery ${delivery_id} accepted by rider ${rider_id}` });
});

router.post('/update-status', (req, res) => {
  const { delivery_id, status } = req.body;
  
  // Example of using Socket.io from req
  const io = (req as any).io;
  if (io) {
    io.to(`delivery_${delivery_id}`).emit('delivery_status_update', { delivery_id, status });
  }

  res.json({ message: `Delivery ${delivery_id} status updated to ${status}` });
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'in_transit', destination: 'Test Location' });
});

export default router;
