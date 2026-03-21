import { Router } from 'express';

const router = Router();

router.post('/create', (req, res) => {
  res.json({ message: 'Donation campaign created successfully', id: 'c1' });
});

router.get('/', (req, res) => {
  res.json([{ id: 'c1', title: 'Test Campaign', goal: 1000, raised: 500 }]);
});

router.post('/contribute', (req, res) => {
  const { campaign_id, amount } = req.body;
  res.json({ message: `Contributed ${amount} to campaign ${campaign_id}` });
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Test Campaign', goal: 1000, raised: 500 });
});

export default router;
