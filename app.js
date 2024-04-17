const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import the cors package
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.post('/fetchToken', async (req, res) => {
  console.log("abracadabra");
  const apiUrl = 'https://api.orange.com/oauth/v3/token';
  const headers = {
    'Authorization': 'Basic QXU1M3JLeEhSMzRsckNyT251emNDV0RrQVExQXVBdmw6WDJsdTJYYVNhWkhJOUczVw==',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  };

  const requestData = {
    grant_type: 'client_credentials',
  };

  // Manually create the x-www-form-urlencoded string
  const formData = Object.keys(requestData)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(requestData[key]))
    .join('&');

  try {
    console.log("inside try block")
    const response = await axios.post(apiUrl, formData, { headers });
    console.log("this is response",response)
    if (response.status === 200) {
      console.log('data response:--', response);
      res.status(200).json({ access_token: response.data.access_token });
    } else {
      console.log("inside else");
      res.status(response.status).json({ error: 'Failed to fetch token' });
    }
  } catch (error) {
    console.log("catch--", error);
    res.status(500).json({ error: `Error fetching token: ${error.message}` });
  }
});

app.post('/makeWebPayment', async (req, res) => {
  const { token, amount } = req.body;
  const apiUrl = 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const randomOrderId = `MY_ORDER_ID_${Date.now()}_${Math.floor(Math.random() * 10000000)}`;
  const body = {
    "merchant_key": "a7cca573",
    "currency": "OUV",
    "order_id": randomOrderId,
    "amount": amount,
    "return_url": "http://myvirtualshop.webnode.es",
    "cancel_url": "http://myvirtualshop.webnode.es/txncncld/",
    "notif_url": "http://www.merchant-example2.org/notif",
    "lang": "fr",
    "reference": "ref Merchant"
  };

  try {
    const response = await axios.post(apiUrl, body, { headers });
    if (response.status === 201) {
      res.status(201).json({ paymentResponse: response.data });
    } else {
      res.status(response.status).json({ error: 'Failed to make web payment' });
    }
  } catch (error) {
    res.status(500).json({ error: `Error making web payment: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
