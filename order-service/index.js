const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const INVENTORY_URL = process.env.INVENTORY_URL || 'http://inventory-service:8080';
let orders = [];
let nextId = 1;

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/orders', async (req, res) => {
  const { sku, qty } = req.body;
  try {
    const reserve = await axios.post(`${INVENTORY_URL}/inventory/${sku}/reserve`, { qty });
    const order = { id: nextId++, sku, qty, status: 'confirmed', remainingStock: reserve.data.remaining };
    orders.push(order);
    res.status(201).json(order);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(502).json({ error: 'inventory-service unreachable' });
  }
});

app.get('/orders', (req, res) => res.json(orders));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`order-service listening on ${PORT}`));