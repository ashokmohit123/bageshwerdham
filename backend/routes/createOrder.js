const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: 'rzp_live_N5c7umzNP5zH1S',
  key_secret: 'gDfNmEddWUleQ0DsGlEAkFKH',
});

app.post('/createOrder', async (req, res) => {
  const { amount } = req.body; // amount in paise
  try {
    const options = {
      amount: amount, // 50000 = 500 INR
      currency: 'INR',
      receipt: 'receipt_order_1',
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
