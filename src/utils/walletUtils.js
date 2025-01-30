const { getSOLBalance, analyzeTokenPurchases, analyzeFrequentTransfers } = require('./solana');

/**
 * Analyze a Solana wallet.
 * @param {string} walletAddress - The wallet address to analyze.
 * @returns {object} - Analysis results including SOL balance, token purchases, and frequent transfers.
 */
async function analyzeWallet(walletAddress) {
    try {
        // Fetch SOL balance
        const solBalance = await getSOLBalance(walletAddress);

        // Analyze token purchases
        const tokenPurchases = await analyzeTokenPurchases(walletAddress);

        // Analyze frequent transfers (SOL/USDC)
        const frequentTransfers = await analyzeFrequentTransfers(walletAddress);

        // Return the analysis results
        return {
            wallet: walletAddress,
            solBalance,
            lastTokenPurchase: tokenPurchases[0]?.date || 'No purchases',
            tokenPurchases,
            frequentTransfers,
        };
    } catch (error) {
        console.error('Error analyzing wallet:', error);
        throw new Error(`Error analyzing wallet: ${error.message}`);
    }
}

module.exports = { analyzeWallet };