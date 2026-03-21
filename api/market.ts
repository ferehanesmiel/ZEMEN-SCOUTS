import { Router } from 'express';

const router = Router();

// Shops
router.post('/shops/create', (req, res) => {
  res.json({ message: 'Shop created successfully', id: 's1' });
});

router.get('/shops', (req, res) => {
  res.json([{ id: 's1', name: 'Test Shop' }]);
});

router.get('/shops/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test Shop' });
});

router.put('/shops/:id', (req, res) => {
  res.json({ message: 'Shop updated successfully', id: req.params.id });
});

// Products
router.post('/products/add', (req, res) => {
  res.json({ message: 'Product added successfully', id: 'p1' });
});

router.get('/products', (req, res) => {
  res.json([{ id: 'p1', name: 'Test Product', price: 100 }]);
});

router.get('/products/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test Product', price: 100 });
});

router.put('/products/:id', (req, res) => {
  res.json({ message: 'Product updated successfully', id: req.params.id });
});

router.delete('/products/:id', (req, res) => {
  res.json({ message: 'Product deleted successfully', id: req.params.id });
});

export default router;
