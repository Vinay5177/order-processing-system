const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ORDER_URL = process.env.ORDER_URL || 'http://order-service:8080';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://inventory-service:8080';

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.post('/api/orders', async (req, res) => {
  try {
    const r = await axios.post(`${ORDER_URL}/orders`, req.body);
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err.response?.status || 502).json(err.response?.data || { error: 'order-service unreachable' });
  }
});

app.get('/api/orders', async (req, res) => {
  const r = await axios.get(`${ORDER_URL}/orders`);
  res.json(r.data);
});

app.get('/api/inventory/:sku', async (req, res) => {
  const r = await axios.get(`${INVENTORY_URL}/inventory/${req.params.sku}`);
  res.json(r.data);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`api-gateway listening on ${PORT}`));