const axios = require('axios');

const GOLD_API_URL = 'https://www.goldapi.io/api/XAU/USD';
const SILVER_API_URL = 'https://www.goldapi.io/api/XAG/USD';
const API_TOKEN = 'YOUR_API_TOKEN'; // Replace with your GoldAPI token

async function fetchGoldPrice() {
    try {
        const response = await axios.get(GOLD_API_URL, {
            headers: { 'x-access-token': API_TOKEN }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching gold price:', error);
    }
}

async function fetchSilverPrice() {
    try {
        const response = await axios.get(SILVER_API_URL, {
            headers: { 'x-access-token': API_TOKEN }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching silver price:', error);
    }
}

async function fetchPrices() {
    const goldPrice = await fetchGoldPrice();
    const silverPrice = await fetchSilverPrice();
    console.log('Gold Price:', goldPrice);
    console.log('Silver Price:', silverPrice);
}

fetchPrices();