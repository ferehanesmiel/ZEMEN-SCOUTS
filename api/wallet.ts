import { Router } from 'express';

const router = Router();

router.get('/:user_id', (req, res) => {
  res.json({ balance: 100, sbr: 50 });
});

router.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  res.json({ message: `Transferred ${amount} to ${to}` });
});

router.post('/convert', (req, res) => {
  const { amount, direction } = req.body;
  res.json({ message: `Converted ${amount} ${direction}` });
});

router.get('/transactions/:user_id', (req, res) => {
  res.json([{ id: '1', type: 'credit', amount: 10 }]);
});

router.post('/credit', (req, res) => {
  const { user_id, amount } = req.body;
  res.json({ message: `Credited ${amount} to ${user_id}` });
});

router.post('/debit', (req, res) => {
  const { user_id, amount } = req.body;
  res.json({ message: `Debited ${amount} from ${user_id}` });
});

export default router;
