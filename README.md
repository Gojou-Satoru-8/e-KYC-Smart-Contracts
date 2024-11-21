# E-KYC Blockchain System

A blockchain-based electronic Know Your Customer (e-KYC) system that allows secure document verification and maintains an immutable record of verified documents. The system is built with React, Node.js, MongoDB, and Ethereum Smart Contracts.

Live Demo: [http://64.227.185.123/](http://64.227.185.123/)

## Features

- **User Management**

  - Secure document submission
  - Real-time status tracking
  - Document history view
  - Blockchain verification status

- **Verifier Dashboard**

  - Document approval/rejection workflow
  - Verification history
  - Automated blockchain recording

- **Organization Access**

  - Document verification using blockchain
  - Multiple verification methods (in-app and external)
  - Immutable verification records

- **Blockchain Integration**
  - Smart contract-based verification
  - Immutable record keeping
  - External verification support via Etherscan

## Technology Stack

- Frontend: React.js with Redux and NextUI
- Backend: Node.js, Express
- Database: MongoDB
- Blockchain: Ethereum (Sepolia Testnet)
- Smart Contracts: Solidity
- File Storage: Local storage with strong encryption

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- MetaMask wallet with Sepolia testnet ETH
- Git
- Vite (for React build)

### Environment Setup

1. Clone the repository

```bash
git clone https://github.com/Gojou-Satoru-8/e-KYC-Smart-Contracts.git
cd e-KYC-Smart-Contracts
```

2. Create .env file in server directory with the following variables:

```env
# Server Configuration
NODE_ENV=
PORT=

# MongoDB Configuration
DB_URI=
DB_PASSWORD=

# Authentication
JWT_SECRET_KEY=
JWT_EXPIRES_IN=
JWT_SHARE_KEY=
JWT_SHARE_KEY_EXPIRES_IN=
PLATFORM_SECRET_KEY=

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRY=

# Email Configuration
EMAIL_USERNAME=
EMAIL_PASSWORD=

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Ethereum Configuration
ETHEREUM_NODE_URL=
ETHEREUM_PRIVATE_KEY=
ETHEREUM_CONTRACT_ADDRESS=
```

Make sure to fill in your own values for each of these environment variables. Do not share sensitive values in public repositories.

### Installation Steps

1. Install Server Dependencies

```bash
cd server
npm install
```

2. Install Client Dependencies

```bash
cd ../client
npm install
```

3. Build Client

```bash
npm run build
```

4. Start Development Server

```bash
cd ../server
npm run dev
```

The application should now be running on `http://localhost:3000`

## Smart Contract

The system uses a custom smart contract for document verification:

- Contract Name: `DocumentVerification`
- Network: Sepolia Testnet
- Etherscan [Link](https://sepolia.etherscan.io/address/0x4d517fbf373ca7de4b643b7909a286c571ae13da)

Features:
- Document verification storage
- Verification status checks
- Event emission for tracking

### External Verification

Users can verify documents externally using:

1. Etherscan's contract interaction
2. Block explorer tools
3. Web3 provider interfaces

## API Documentation

The backend provides RESTful APIs for:

- User management
- Document handling
- Verification processes
- Blockchain interactions

Key endpoints include:

- `/api/v1/users`
- `/api/v1/documents`
- `/api/v1/verify`

## Security Features

- JWT-based authentication
- Document encryption using AES-256-GCM
- Secure blockchain integration
- Role-based access control
- Password hashing using bcrypt
## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.

## Support

For support, please raise an issue in the GitHub repository or contact the maintainers.
