# Web POS - A workshop to integrate the Breez SDK

A Point of Sale (POS) application built with Vite, React, and TypeScript that uses the Bitcoin Lightning Network for payments.

## Workshop

Go through the code (there are TODO hints), initialize a Breez SDK - Nodeless instance and use the Breez SDK to manage payments.

## Features

- Create and manage items in the inventory
- Add items to basket
- Local storage for item persistence
- Generate BOLT11 Lightning invoices for checkout
- Real-time payment detection
- Responsive design with Tailwind

## Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the project root with your Breez SDK credentials:
```
VITE_BREEZ_API_KEY=your_breez_api_key_here
VITE_BREEZ_MNEMONIC=your_breez_mnemonic_here
```

4. Start the development server:
```
npm run dev
```

## Usage

1. Go to "Manage Items" to add items to your inventory
2. Navigate to the Store page to view items and add them to your basket
3. Proceed to checkout to generate a Lightning invoice
4. Pay the invoice using any Lightning wallet
5. Receive confirmation when payment is processed

## Technologies Used

- Vite
- React
- TypeScript
- React Router
- Tailwind
- Breez SDK (@breeztech/breez-sdk-liquid)
- Local Storage for data persistence

## Lightning Network Integration

This application uses the Breez SDK to connect to the Lightning Network for payment processing. When a customer checks out, a BOLT11 invoice is generated that can be paid with any Lightning wallet.

## Environment Variables

- `VITE_BREEZ_API_KEY`: Your Breez SDK API key
- `VITE_BREEZ_MNEMONIC`: Your Breez SDK mnemonic for wallet authentication

## Development

To build the application for production:

```
npm run build
```

## License

MIT
