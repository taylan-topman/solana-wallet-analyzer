require('dotenv').config();
const axios = require('axios');

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

if (!SOLANA_RPC_URL) {
    throw new Error("SOLANA_RPC_URL is not defined in .env file.");
}

// Utility to retry a request up to 3 times with exponential backoff
const retryRequest = async (requestFunc, retries = 3, delay = 1000) => {
    let attempts = 0;
    while (attempts < retries) {
        try {
            return await requestFunc();
        } catch (error) {
            attempts++;
            console.warn(`Request failed. Attempt ${attempts} of ${retries}. Retrying...`);
            if (attempts >= retries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay * attempts));
        }
    }
};

/**
 * Fetch transaction signatures with pagination.
 * @param {string} walletAddress - The wallet address.
 * @param {number} limit - How many transactions to fetch.
 * @returns {Promise<Array>} - List of transaction signatures.
 */
const fetchTransactionSignatures = async (walletAddress, limit = 5) => {
    let signatures = [];
    let before = null;

    while (signatures.length < limit) {
        const params = { limit: limit - signatures.length, before };
        const response = await retryRequest(() =>
            axios.post(SOLANA_RPC_URL, {
                jsonrpc: "2.0",
                id: 1,
                method: "getConfirmedSignaturesForAddress2",
                params: [walletAddress, params]
            })
        );
        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        const newSignatures = response.data.result;
        if (newSignatures.length === 0) break;

        signatures = signatures.concat(newSignatures);
        before = newSignatures[newSignatures.length - 1].signature;
    }

    return signatures;
};

/**
 * Analyze token purchases with retries.
 * @param {string} walletAddress - The wallet address.
 * @returns {Promise<Array>} - List of token purchases.
 */
async function analyzeTokenPurchases(walletAddress) {
    try {
        const signatures = await fetchTransactionSignatures(walletAddress, 5);  // Limiting to 5 transactions
        if (signatures.length === 0) return [];

        const purchases = [];
        for (const signature of signatures) {
            try {
                const txResponse = await retryRequest(() =>
                    axios.post(SOLANA_RPC_URL, {
                        jsonrpc: "2.0",
                        id: 1,
                        method: "getTransaction",
                        params: [signature.signature, { encoding: "jsonParsed" }]
                    })
                );

                const transaction = txResponse.data.result;
                if (!transaction) continue;

                const instructions = transaction.transaction.message.instructions;
                const tokenTransfers = instructions.filter(instr => instr.program === "spl-token");

                if (tokenTransfers.length > 0) {
                    purchases.push({
                        signature: signature.signature,
                        date: new Date(transaction.blockTime * 1000).toISOString()
                    });
                }
            } catch (error) {
                console.warn(`Skipping failed transaction fetch: ${signature.signature}`);
            }
        }

        return purchases;
    } catch (error) {
        console.error('Error analyzing token purchases:', error.message || error);
        throw new Error(`Error analyzing token purchases: ${error.message || error}`);
    }
}

module.exports = { fetchTransactionSignatures, analyzeTokenPurchases };
