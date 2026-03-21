import { Router } from 'express';

const router = Router();

router.get('/:user_id', (req, res) => {
  res.json([{ id: 'n1', message: 'Test Notification', read: false }]);
});

router.post('/send', (req, res) => {
  const { user_id, message } = req.body;
  res.json({ message: `Notification sent to ${user_id}` });
});

router.put('/read', (req, res) => {
  const { notification_id } = req.body;
  res.json({ message: `Notification ${notification_id} marked as read` });
});

export default router;
