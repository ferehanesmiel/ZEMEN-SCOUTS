import { Router } from 'express';

const router = Router();

router.post('/add', (req, res) => {
  const { entity_id, rating, review } = req.body;
  res.json({ message: `Rating added for entity ${entity_id}` });
});

router.get('/:entity_id', (req, res) => {
  res.json([{ id: 'r1', entity_id: req.params.entity_id, rating: 5, review: 'Great!' }]);
});

export default router;
