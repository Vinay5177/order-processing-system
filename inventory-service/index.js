const express = require('express');
const app = express();
app.use(express.json());

let stock = { "sku-101": 50, "sku-102": 20, "sku-103": 5 };

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/inventory/:sku', (req, res) => {
  const qty = stock[req.params.sku];
  if (qty === undefined) return res.status(404).json({ error: 'sku not found' });
  res.json({ sku: req.params.sku, quantity: qty });
});

app.post('/inventory/:sku/reserve', (req, res) => {
  const { qty } = req.body;
  const sku = req.params.sku;
  if (stock[sku] === undefined) return res.status(404).json({ error: 'sku not found' });
  if (stock[sku] < qty) return res.status(409).json({ error: 'insufficient stock' });
  stock[sku] -= qty;
  res.json({ sku, remaining: stock[sku] });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`inventory-service listening on ${PORT}`));