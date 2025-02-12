const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const { generateBinancePayHeaders } = require('../utilities/binancePayUtils');
const { logger } = require('../utilities/logger');
require('dotenv').config();
const router = express.Router();

// Stripe payment endpoint
router.post('/stripe', async (req, res) => {
	const { amount, source } = req.body; // 'source' is the token id generated by Stripe on the frontend
	try {
		const charge = await stripe.charges.create({
			amount: amount * 100, // Convert to cents
			currency: 'usd',
			source: source,
			description: 'Product purchase description',
		});
		res.json({ success: true, charge });
	} catch (error) {
		logger.error('Stripe Charge Error:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

// Binance Pay payment endpoint (Corrected and updated version)
router.post('/binancepay', async (req, res) => {
	const requestBody = JSON.stringify(req.body);
	const apiKey = process.env.BINANCE_PAY_CERTIFICATE_SN;
	const secretKey = process.env.BINANCE_PAY_SECRET_KEY;

	const headers = generateBinancePayHeaders(apiKey, secretKey, requestBody);

	try {
		// Ensure you're using the correct Binance Pay URL and endpoint
		const response = await axios.post('https://bpay.binanceapi.com/binancepay/openapi/v1/order', requestBody, {
			headers,
		});
		res.json(response.data);
	} catch (error) {
		logger.error('Error making Binance Pay request:', error.response ? error.response.data : error);
		res.status(500).json({ message: 'Failed to process payment with Binance Pay' });
	}
});

module.exports = router;
