const { getSOLBalance, analyzeTokenPurchases, analyzeFrequentTransfers } = require('./solana');

/**
 * Validate Solana wallet address.
 * @param {string} walletAddress - The wallet address to validate.
 * @returns {boolean} - Returns true if valid, false otherwise.
 */
function isValidSolanaAddress(walletAddress) {
    return typeof walletAddress === 'string' && walletAddress.length === 44; // Typical Solana addresses are 44 characters long.
}

/**
 * Analyze a Solana wallet.
 * @param {string} walletAddress - The wallet address.
 * @returns {Promise<Object>} - Wallet analysis results.
 */
async function analyzeWallet(walletAddress) {
    try {
        if (!isValidSolanaAddress(walletAddress)) {
            throw new Error('Invalid Solana wallet address');
        }

        // Fetch SOL balance
        const solBalance = await getSOLBalance(walletAddress).catch(err => {
            console.error('Error fetching SOL balance:', err.message || err);
            return null;
        });

        // Fetch token purchase transactions
        const tokenPurchases = await analyzeTokenPurchases(walletAddress).catch(err => {
            console.error('Error analyzing token purchases:', err.message || err);
            return [];
        });

        // Analyze frequent transfers
        const frequentTransfers = await analyzeFrequentTransfers(walletAddress).catch(err => {
            console.error('Error analyzing frequent transfers:', err.message || err);
            return [];
        });

        return {
            solBalance,
            tokenPurchases,
            frequentTransfers
        };
    } catch (error) {
        console.error('Error analyzing wallet:', error.message || error);
        throw new Error(`Error analyzing wallet: ${error.message || error}`);
    }
}

module.exports = { analyzeWallet };
