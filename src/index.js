// Load environment variables from .env file
require('dotenv').config();

// Import the wallet analysis function
const { analyzeWallet } = require('./utils/walletUtils');

// Define the wallet address to analyze
const walletAddress = '7N5RttNHACgrj9iBFJeNTY8tLaSxMELsJ7B34j25gHmL'; // Replace with the wallet address you want to analyze

// Run the analysis and log the results
analyzeWallet(walletAddress)
    .then(analysis => {
        console.log('Wallet Analysis Results:');
        console.log(analysis);
    })
    .catch(error => {
        console.error('Error analyzing wallet:', error);
    });

    