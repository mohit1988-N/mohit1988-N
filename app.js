// Tax Registry DApp JavaScript
// Using ethers.js for blockchain interactions

class TaxRegistryDApp {
    constructor() {
        // Contract configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
        this.CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE'; // Replace with actual contract address
        this.CONTRACT_ABI = [
            // REPLACE WITH YOUR ACTUAL CONTRACT ABI
            // Example ABI structure - replace with your actual ABI
            {
                "inputs": [{"name": "_taxpayerAddress", "type": "address"}, {"name": "_name", "type": "string"}],
                "name": "registerTaxpayer",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_taxpayer", "type": "address"}],
                "name": "getTaxpayerInfo",
                "outputs": [{"name": "name", "type": "string"}, {"name": "totalPaid", "type": "uint256"}, {"name": "lastPayment", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "payTax",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_to", "type": "address"}, {"name": "_amount", "type": "uint256"}],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [{"indexed": true, "name": "_taxpayer", "type": "address"}, {"indexed": false, "name": "_name", "type": "string"}],
                "name": "TaxpayerRegistered",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [{"indexed": true, "name": "_taxpayer", "type": "address"}, {"indexed": false, "name": "_amount", "type": "uint256"}],
                "name": "TaxPaid",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [{"indexed": true, "name": "_to", "type": "address"}, {"indexed": false, "name": "_amount", "type": "uint256"}],
                "name": "FundsWithdrawn",
                "type": "event"
            }
        ];

        // Initialize variables
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.currentAccount = null;
        this.isAdmin = false;

        // Initialize the DApp
        this.init();
    }

    async init() {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            this.showMessage('MetaMask is not installed. Please install MetaMask to use this DApp.', 'error');
            return;
        }

        // Set up event listeners
        this.setupEventListeners();

        // Set up MetaMask event listeners
        this.setupMetaMaskListeners();

        // Check if already connected
        await this.checkConnection();

        this.showMessage('DApp initialized. Please connect your wallet to continue.', 'info');
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());

        // Admin functions
        document.getElementById('registerTaxpayer').addEventListener('click', () => this.registerTaxpayer());
        document.getElementById('viewTaxpayerInfo').addEventListener('click', () => this.viewTaxpayerInfo());
        document.getElementById('withdrawFunds').addEventListener('click', () => this.withdrawFunds());

        // Taxpayer functions
        document.getElementById('payTax').addEventListener('click', () => this.payTax());
        document.getElementById('viewMyInfo').addEventListener('click', () => this.viewMyTaxInfo());
    }

    setupMetaMaskListeners() {
        // Account changed
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnectWallet();
            } else {
                this.handleAccountChange(accounts[0]);
            }
        });

        // Network changed
        window.ethereum.on('chainChanged', (chainId) => {
            this.handleNetworkChange(chainId);
        });
    }

    async checkConnection() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this.connectWallet();
            }
        } catch (error) {
            console.error('Error checking connection:', error);
        }
    }

    async connectWallet() {
        try {
            this.showMessage('Connecting to MetaMask...', 'info');

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            // Initialize provider and signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.currentAccount = accounts[0];

            // Initialize contract
            if (this.CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
                this.showMessage('Warning: Contract address not set. Please update CONTRACT_ADDRESS in app.js', 'warning');
            } else {
                this.contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.CONTRACT_ABI, this.signer);
                this.setupContractEventListeners();
            }

            // Update UI
            await this.updateWalletInfo();
            await this.checkUserRole();
            this.updateUIForConnection();

            this.showMessage('Wallet connected successfully!', 'success');

        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showMessage(`Failed to connect wallet: ${error.message}`, 'error');
        }
    }

    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.currentAccount = null;
        this.isAdmin = false;

        this.updateUIForDisconnection();
        this.showMessage('Wallet disconnected', 'info');
    }

    async handleAccountChange(newAccount) {
        this.currentAccount = newAccount;
        await this.updateWalletInfo();
        await this.checkUserRole();
        this.showMessage(`Account changed to ${this.formatAddress(newAccount)}`, 'info');
    }

    async handleNetworkChange(chainId) {
        await this.updateWalletInfo();
        this.showMessage(`Network changed to ${parseInt(chainId, 16)}`, 'info');
    }

    async updateWalletInfo() {
        try {
            if (!this.provider || !this.currentAccount) return;

            // Update account
            document.getElementById('connectedAccount').textContent = this.formatAddress(this.currentAccount);

            // Update network
            const network = await this.provider.getNetwork();
            document.getElementById('networkInfo').textContent = `${network.name} (${network.chainId})`;

            // Update balance
            const balance = await this.provider.getBalance(this.currentAccount);
            document.getElementById('accountBalance').textContent = `${ethers.utils.formatEther(balance).substring(0, 8)} ETH`;

            // Update contract info
            if (this.contract) {
                document.getElementById('contractAddress').textContent = this.formatAddress(this.CONTRACT_ADDRESS);
                const contractBalance = await this.provider.getBalance(this.CONTRACT_ADDRESS);
                document.getElementById('contractBalance').textContent = `${ethers.utils.formatEther(contractBalance).substring(0, 8)} ETH`;
            }

        } catch (error) {
            console.error('Error updating wallet info:', error);
        }
    }

    async checkUserRole() {
        try {
            if (!this.contract || !this.currentAccount) return;

            // Check if current account is the contract owner (admin)
            const owner = await this.contract.owner();
            this.isAdmin = owner.toLowerCase() === this.currentAccount.toLowerCase();

            document.getElementById('userRole').textContent = this.isAdmin ? 'Admin' : 'Taxpayer';

            // Show appropriate sections
            if (this.isAdmin) {
                document.getElementById('adminSection').classList.remove('hidden');
                document.getElementById('taxpayerSection').classList.add('hidden');
            } else {
                document.getElementById('adminSection').classList.add('hidden');
                document.getElementById('taxpayerSection').classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error checking user role:', error);
            document.getElementById('userRole').textContent = 'Unknown';
        }
    }

    updateUIForConnection() {
        document.getElementById('connectWallet').textContent = 'Connected';
        document.getElementById('connectWallet').disabled = true;
        document.getElementById('walletSection').classList.remove('hidden');
        document.getElementById('contractSection').classList.remove('hidden');
    }

    updateUIForDisconnection() {
        document.getElementById('connectWallet').textContent = 'Connect Wallet';
        document.getElementById('connectWallet').disabled = false;
        document.getElementById('walletSection').classList.add('hidden');
        document.getElementById('adminSection').classList.add('hidden');
        document.getElementById('taxpayerSection').classList.add('hidden');
        document.getElementById('contractSection').classList.add('hidden');
    }

    // Admin Functions
    async registerTaxpayer() {
        try {
            if (!this.isAdmin) {
                this.showMessage('Only admin can register taxpayers', 'error');
                return;
            }

            const address = document.getElementById('taxpayerAddress').value.trim();
            const name = document.getElementById('taxpayerName').value.trim();

            if (!address || !name) {
                this.showMessage('Please provide both address and name', 'error');
                return;
            }

            if (!ethers.utils.isAddress(address)) {
                this.showMessage('Invalid Ethereum address', 'error');
                return;
            }

            this.showMessage('Registering taxpayer...', 'info');

            const tx = await this.contract.registerTaxpayer(address, name);
            await tx.wait();

            this.showMessage(`Taxpayer ${name} registered successfully!`, 'success');

            // Clear inputs
            document.getElementById('taxpayerAddress').value = '';
            document.getElementById('taxpayerName').value = '';

        } catch (error) {
            console.error('Error registering taxpayer:', error);
            this.showMessage(`Failed to register taxpayer: ${this.getErrorMessage(error)}`, 'error');
        }
    }

    async viewTaxpayerInfo() {
        try {
            if (!this.isAdmin) {
                this.showMessage('Only admin can view taxpayer info', 'error');
                return;
            }

            const address = document.getElementById('viewTaxpayerAddress').value.trim();

            if (!address) {
                this.showMessage('Please provide taxpayer address', 'error');
                return;
            }

            if (!ethers.utils.isAddress(address)) {
                this.showMessage('Invalid Ethereum address', 'error');
                return;
            }

            this.showMessage('Fetching taxpayer info...', 'info');

            const info = await this.contract.getTaxpayerInfo(address);
            
            const display = document.getElementById('taxpayerInfoDisplay');
            display.textContent = `
Name: ${info.name}
Address: ${address}
Total Paid: ${ethers.utils.formatEther(info.totalPaid)} ETH
Last Payment: ${info.lastPayment.toString() === '0' ? 'Never' : new Date(info.lastPayment.toNumber() * 1000).toLocaleString()}
            `.trim();

            this.showMessage('Taxpayer info retrieved successfully', 'success');

        } catch (error) {
            console.error('Error viewing taxpayer info:', error);
            document.getElementById('taxpayerInfoDisplay').textContent = 'Failed to load taxpayer information';
            this.showMessage(`Failed to get taxpayer info: ${this.getErrorMessage(error)}`, 'error');
        }
    }

    async withdrawFunds() {
        try {
            if (!this.isAdmin) {
                this.showMessage('Only admin can withdraw funds', 'error');
                return;
            }

            const address = document.getElementById('withdrawAddress').value.trim();
            const amount = document.getElementById('withdrawAmount').value.trim();

            if (!address || !amount) {
                this.showMessage('Please provide both withdrawal address and amount', 'error');
                return;
            }

            if (!ethers.utils.isAddress(address)) {
                this.showMessage('Invalid Ethereum address', 'error');
                return;
            }

            if (isNaN(amount) || parseFloat(amount) <= 0) {
                this.showMessage('Invalid amount', 'error');
                return;
            }

            this.showMessage('Processing withdrawal...', 'info');

            const amountWei = ethers.utils.parseEther(amount);
            const tx = await this.contract.withdraw(address, amountWei);
            await tx.wait();

            this.showMessage(`Successfully withdrew ${amount} ETH to ${this.formatAddress(address)}`, 'success');

            // Clear inputs
            document.getElementById('withdrawAddress').value = '';
            document.getElementById('withdrawAmount').value = '';

            // Update contract balance
            await this.updateWalletInfo();

        } catch (error) {
            console.error('Error withdrawing funds:', error);
            this.showMessage(`Failed to withdraw funds: ${this.getErrorMessage(error)}`, 'error');
        }
    }

    // Taxpayer Functions
    async payTax() {
        try {
            if (this.isAdmin) {
                this.showMessage('Admin account cannot pay taxes', 'error');
                return;
            }

            const amount = document.getElementById('taxAmount').value.trim();

            if (!amount) {
                this.showMessage('Please provide tax amount', 'error');
                return;
            }

            if (isNaN(amount) || parseFloat(amount) <= 0) {
                this.showMessage('Invalid amount', 'error');
                return;
            }

            this.showMessage('Processing tax payment...', 'info');

            const amountWei = ethers.utils.parseEther(amount);
            const tx = await this.contract.payTax({ value: amountWei });
            await tx.wait();

            this.showMessage(`Successfully paid ${amount} ETH in taxes!`, 'success');

            // Clear input
            document.getElementById('taxAmount').value = '';

            // Update balances and tax info
            await this.updateWalletInfo();
            await this.viewMyTaxInfo();

        } catch (error) {
            console.error('Error paying tax:', error);
            this.showMessage(`Failed to pay tax: ${this.getErrorMessage(error)}`, 'error');
        }
    }

    async viewMyTaxInfo() {
        try {
            if (!this.currentAccount) {
                this.showMessage('Please connect your wallet first', 'error');
                return;
            }

            this.showMessage('Fetching your tax info...', 'info');

            const info = await this.contract.getTaxpayerInfo(this.currentAccount);
            
            const display = document.getElementById('myTaxInfoDisplay');
            display.textContent = `
Name: ${info.name || 'Not registered'}
Address: ${this.currentAccount}
Total Paid: ${ethers.utils.formatEther(info.totalPaid)} ETH
Last Payment: ${info.lastPayment.toString() === '0' ? 'Never' : new Date(info.lastPayment.toNumber() * 1000).toLocaleString()}
            `.trim();

            this.showMessage('Tax info retrieved successfully', 'success');

        } catch (error) {
            console.error('Error viewing tax info:', error);
            document.getElementById('myTaxInfoDisplay').textContent = 'Failed to load tax information. You may not be registered as a taxpayer.';
            this.showMessage(`Failed to get tax info: ${this.getErrorMessage(error)}`, 'error');
        }
    }

    // Contract Event Listeners
    setupContractEventListeners() {
        if (!this.contract) return;

        // Listen for TaxpayerRegistered events
        this.contract.on('TaxpayerRegistered', (taxpayer, name, event) => {
            this.showMessage(`New taxpayer registered: ${name} (${this.formatAddress(taxpayer)})`, 'info');
        });

        // Listen for TaxPaid events
        this.contract.on('TaxPaid', (taxpayer, amount, event) => {
            const amountEth = ethers.utils.formatEther(amount);
            this.showMessage(`Tax payment received: ${amountEth} ETH from ${this.formatAddress(taxpayer)}`, 'info');
        });

        // Listen for FundsWithdrawn events
        this.contract.on('FundsWithdrawn', (to, amount, event) => {
            const amountEth = ethers.utils.formatEther(amount);
            this.showMessage(`Funds withdrawn: ${amountEth} ETH to ${this.formatAddress(to)}`, 'info');
        });
    }

    // Utility Functions
    showMessage(message, type = 'info') {
        const container = document.getElementById('statusMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `status-message status-${type}`;
        messageElement.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        
        container.appendChild(messageElement);
        
        // Remove old messages (keep only last 10)
        const messages = container.children;
        if (messages.length > 10) {
            container.removeChild(messages[0]);
        }
        
        // Auto-remove after 10 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 10000);
        }

        // Scroll to latest message
        messageElement.scrollIntoView({ behavior: 'smooth' });
    }

    formatAddress(address) {
        if (!address) return 'Unknown';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    getErrorMessage(error) {
        if (error.reason) return error.reason;
        if (error.message) {
            // Extract readable message from error
            if (error.message.includes('user rejected')) {
                return 'Transaction was rejected by user';
            }
            if (error.message.includes('insufficient funds')) {
                return 'Insufficient funds for transaction';
            }
            return error.message;
        }
        return 'Unknown error occurred';
    }
}

// Initialize the DApp when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.taxRegistryDApp = new TaxRegistryDApp();
});