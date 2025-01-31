const readline = require('readline');
const { analyzeWallet } = require('./utils/walletUtils');

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask for the wallet address
rl.question('Please enter the Solana wallet address: ', async (walletAddress) => {
    try {
        // Trim input to remove accidental spaces
        walletAddress = walletAddress.trim();

        // Validate input
        if (!walletAddress || walletAddress.length !== 44) {
            throw new Error('Invalid Solana wallet address. It should be 44 characters long.');
        }

        console.log('\nAnalyzing wallet, please wait...\n');

        // Call the analyzeWallet function
        const analysis = await analyzeWallet(walletAddress);

        // Log the analysis results
        console.log('=== Wallet Analysis Results ===');
        console.log(`SOL Balance: ${analysis.solBalance !== null ? analysis.solBalance + ' SOL' : 'Error fetching balance'}`);
        console.log('\nToken Purchases:');
        console.table(analysis.tokenPurchases.length > 0 ? analysis.tokenPurchases : ['No token purchases found.']);
        console.log('\nFrequent Transfers:');
        console.table(analysis.frequentTransfers.length > 0 ? analysis.frequentTransfers : ['No frequent transfers found.']);
    } catch (error) {
        console.error('\n❌ Error analyzing wallet:', error.message);
    } finally {
        // Close the readline interface
        rl.close();
    }
});
