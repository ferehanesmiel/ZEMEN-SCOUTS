import { Router } from 'express';

const router = Router();

router.post('/update-location', (req, res) => {
  const { delivery_id, lat, lng } = req.body;
  
  // Use Socket.io to broadcast the location update
  const io = (req as any).io;
  if (io) {
    io.to(`delivery_${delivery_id}`).emit('rider_location_update', { delivery_id, lat, lng });
  }

  res.json({ message: 'Location updated successfully' });
});

router.get('/:delivery_id', (req, res) => {
  res.json({ delivery_id: req.params.delivery_id, lat: 9.0227, lng: 38.7468 });
});

export default router;
