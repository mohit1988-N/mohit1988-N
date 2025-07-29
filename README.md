# Tax Registry DApp

A blockchain-based tax registry system built with HTML, JavaScript, and ethers.js for interacting with Ethereum smart contracts through MetaMask.

## Features

### For Administrators (Contract Deployer)
- Register new taxpayers with their Ethereum address and name
- View detailed information for any registered taxpayer
- Withdraw funds from the contract to any address
- Monitor all contract activities through real-time event listening

### For Taxpayers
- Pay taxes by sending ETH to the contract
- View personal tax information (name, total paid, last payment date)
- Real-time updates when payments are processed

### General Features
- **MetaMask Integration**: Secure wallet connection required for all operations
- **Role-Based Access**: Automatic detection of admin vs taxpayer roles
- **Real-Time Updates**: Live contract event listening and status messages
- **Account/Network Handling**: Automatic detection of account and network changes
- **Responsive Design**: Clean, modern UI that works on desktop and mobile
- **Error Handling**: Comprehensive error messages and transaction feedback

## Prerequisites

1. **MetaMask Browser Extension**: Install from [metamask.io](https://metamask.io/)
2. **Ethereum Testnet Access**: Configure MetaMask for your target network (e.g., Sepolia, Goerli)
3. **Test ETH**: Obtain test ETH from a faucet for transaction fees
4. **Deployed Smart Contract**: You'll need the contract address and ABI

## Setup Instructions

### 1. Configure Contract Details

Open `app.js` and update the following placeholders:

```javascript
// Line ~7: Replace with your actual contract address
this.CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

// Lines ~8-52: Replace with your actual contract ABI
this.CONTRACT_ABI = [
    // Your contract ABI goes here
];
```

### 2. Expected Contract Interface

Your smart contract should implement the following functions and events:

#### Functions:
```solidity
// Admin functions
function registerTaxpayer(address _taxpayerAddress, string memory _name) external;
function withdraw(address _to, uint256 _amount) external;
function owner() external view returns (address);

// Taxpayer functions  
function payTax() external payable;
function getTaxpayerInfo(address _taxpayer) external view returns (string memory name, uint256 totalPaid, uint256 lastPayment);
```

#### Events:
```solidity
event TaxpayerRegistered(address indexed _taxpayer, string _name);
event TaxPaid(address indexed _taxpayer, uint256 _amount);
event FundsWithdrawn(address indexed _to, uint256 _amount);
```

### 3. Deploy the Files

Place all files in a web server directory:
```
tax-registry-dapp/
├── index.html
├── styles.css
├── app.js
└── README.md
```

Serve the files using any web server (e.g., Python's `python -m http.server` or Node.js `npx serve`).

## Usage Guide

### Initial Setup

1. **Open the DApp**: Navigate to `index.html` in your web browser
2. **Connect MetaMask**: Click "Connect Wallet" and approve the connection
3. **Verify Network**: Ensure you're on the correct Ethereum network
4. **Check Role**: The interface will automatically detect if you're an admin or taxpayer

### Admin Operations

#### Register a Taxpayer
1. Navigate to the "Admin Controls" section
2. Under "Register Taxpayer":
   - Enter the taxpayer's Ethereum address
   - Enter the taxpayer's name
   - Click "Register Taxpayer"
3. Confirm the transaction in MetaMask
4. Wait for confirmation and check the status messages

#### View Taxpayer Information
1. Under "View Taxpayer Info":
   - Enter the taxpayer's Ethereum address
   - Click "View Info"
2. The taxpayer's details will appear below

#### Withdraw Funds
1. Under "Withdraw Funds":
   - Enter the destination address
   - Enter the amount in ETH
   - Click "Withdraw Funds"
2. Confirm the transaction in MetaMask

### Taxpayer Operations

#### Pay Taxes
1. Navigate to the "Taxpayer Controls" section
2. Under "Pay Tax":
   - Enter the tax amount in ETH
   - Click "Pay Tax"
3. Confirm the transaction in MetaMask
4. Your tax information will update automatically

#### View Personal Tax Information
1. Click "Refresh My Info" to see:
   - Your registered name
   - Total amount paid in taxes
   - Date of last payment

## File Structure

### `index.html`
- Complete HTML structure with semantic sections
- Responsive design with proper form controls
- Status message container for user feedback
- Role-based UI sections (admin/taxpayer)

### `styles.css`
- Modern, clean styling with CSS Grid and Flexbox
- Responsive design for mobile and desktop
- Status message styling with animations
- Professional color scheme and typography

### `app.js`
- Main application logic using ES6 classes
- Complete Web3 integration with ethers.js
- MetaMask connection and event handling
- Smart contract interaction functions
- Comprehensive error handling and user feedback

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **MetaMask Required**: The DApp requires MetaMask browser extension
- **JavaScript Enabled**: Ensure JavaScript is enabled in your browser

## Security Considerations

1. **Smart Contract Security**: Ensure your smart contract has been properly audited
2. **Address Validation**: All address inputs are validated before transactions
3. **Amount Validation**: Numeric inputs are validated to prevent errors
4. **Error Handling**: Comprehensive error handling prevents application crashes
5. **MetaMask Security**: Users maintain full control of their private keys

## Troubleshooting

### Common Issues

**"MetaMask is not installed"**
- Install the MetaMask browser extension and refresh the page

**"Contract address not set"**
- Update the `CONTRACT_ADDRESS` variable in `app.js`

**"Failed to connect wallet"**
- Ensure MetaMask is unlocked and accessible
- Check that you have the correct network selected

**"Transaction failed"**
- Verify you have sufficient ETH for gas fees
- Check that the contract address and ABI are correct
- Ensure you're on the correct network

**Role detection issues**
- The admin role is determined by the contract's `owner()` function
- Ensure the connected account matches the contract deployer

### Network Issues

**Wrong Network**
- Switch MetaMask to the network where your contract is deployed
- The DApp will automatically detect network changes

**Transaction Stuck**
- Increase gas fees in MetaMask
- Try clearing pending transactions

## Development Notes

### Customization

The DApp can be easily customized:
- **Styling**: Modify `styles.css` for different themes
- **Functionality**: Extend `app.js` for additional features
- **Layout**: Update `index.html` for different UI arrangements

### Contract Integration

To integrate with a different contract:
1. Update `CONTRACT_ADDRESS` and `CONTRACT_ABI`
2. Modify function calls in `app.js` if function names differ
3. Update event listeners if event names/structures differ

## License

This project is provided as-is for educational and development purposes.

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify MetaMask connection and network settings
3. Ensure contract address and ABI are correctly configured
4. Review the troubleshooting section above
