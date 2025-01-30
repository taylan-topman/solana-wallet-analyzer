const { Connection, PublicKey } = require('@solana/web3.js');

// Load the Solana RPC URL from environment variables
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

// Verify the RPC URL
if (!SOLANA_RPC_URL || !SOLANA_RPC_URL.startsWith('http')) {
    throw new Error('Invalid Solana RPC URL. Please check your .env file.');
}

// Initialize the connection
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * Fetch the SOL balance of a wallet.
 * @param {string} walletAddress - The wallet address.
 * @returns {number} - The SOL balance.
 */
async function getSOLBalance(walletAddress) {
    try {
        const publicKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error('Error fetching SOL balance:', error);
        throw new Error(`Error fetching SOL balance: ${error.message}`);
    }
}

/**
 * Fetch and parse token purchases for a wallet.
 * @param {string} walletAddress - The wallet address.
 * @returns {array} - List of token purchases.
 */
async function analyzeTokenPurchases(walletAddress) {
    try {
        const publicKey = new PublicKey(walletAddress);
        const transactions = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
        const tokenPurchases = [];

        for (const tx of transactions) {
            const parsedTx = await connection.getParsedTransaction(tx.signature);
            if (parsedTx?.meta?.preTokenBalances) {
                parsedTx.meta.preTokenBalances.forEach(balance => {
                    tokenPurchases.push({
                        token: balance.mint,
                        amount: balance.uiTokenAmount.uiAmount,
                        date: new Date(parsedTx.blockTime * 1000).toISOString(),
                    });
                });
            }
        }

        return tokenPurchases;
    } catch (error) {
        console.error('Error analyzing token purchases:', error);
        throw new Error(`Error analyzing token purchases: ${error.message}`);
    }
}

/**
 * Analyze frequent transfers (SOL/USDC) for a wallet.
 * @param {string} walletAddress - The wallet address.
 * @returns {array} - List of wallets that received SOL/USDC more than 3 times.
 */
async function analyzeFrequentTransfers(walletAddress) {
    try {
        const publicKey = new PublicKey(walletAddress);
        const transactions = await connection.getSignaturesForAddress(publicKey, { limit: 100 });
        const transferCounts = {};

        for (const tx of transactions) {
            const parsedTx = await connection.getParsedTransaction(tx.signature);
            if (parsedTx?.transaction?.message?.instructions) {
                parsedTx.transaction.message.instructions.forEach(instruction => {
                    if (instruction.program === 'spl-token' && instruction.parsed?.info?.destination) {
                        const destination = instruction.parsed.info.destination;
                        transferCounts[destination] = (transferCounts[destination] || 0) + 1;
                    }
                });
            }
        }

        const frequentTransfers = Object.entries(transferCounts)
            .filter(([_, count]) => count > 3)
            .map(([wallet, _]) => wallet);

        return frequentTransfers;
    } catch (error) {
        console.error('Error analyzing frequent transfers:', error);
        throw new Error(`Error analyzing frequent transfers: ${error.message}`);
    }
}

module.exports = { getSOLBalance, analyzeTokenPurchases, analyzeFrequentTransfers };