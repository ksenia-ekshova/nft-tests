# NFT Collection Tests

This project contains examples of integration tests to test the operation of a smart contract for creating an NFT collection and an NFT mint on the Polygon Mumbai testnet.
Preconditions: creating a new wallet, replenishing its balance from bank account, interacting with the contract (creating an NFT collection and mint NFT) are implemented using the Ethers library.
To test the NFT collection through the API, the Moralis library and API key were used, and the Axios library was used to interact with the application backend.
Mocha was chosen as the test runner.
The sensitive data is placed in the .env file, for local launch, see the description below.

# Task

Smart contract on the Polygon Mumbai EVM chain (address: 0x54eede47850fe932f5466b6fa708bf1176371966) for creating NFT collections and NFTs in them.
A backend application that tracks contract events (item 1) on the blockchain, stores them in memory and provides access via an API. Image: evercoinx/faraway:nft-collection-deployer-backend. It is important to note that only events that occurred after the backend application was launched are available.
A client application (evercoinx/faraway:nft-collection-deployer-frontend image) interacting with a smart contract (creating and sending transactions) and a backend application (receiving and displaying events).

- Cases for testing
Creating a collection: when the form is filled out correctly and the transaction is sent, a new event is expected to be output containing data from the form, as well as the address of the created collection in the application interface.
NFT creation: if the form data is filled out correctly, the successful creation of an NFT in the selected collection is expected and an event about this is displayed in the application interface.

- Requirements for the solution
The solution must be submitted as a project on GitHub with a configured action for manual execution. The addresses of the images must be included in the action parameters for verification.

- Notes
To familiarize yourself with the functionality of the services, it is recommended to use the Chrome browser with the Metamask extension installed.
How to add Polygon Mumbai test chain to Metamask: https://www.datawallet.com/crypto/add-polygon-mumbai-to-metamask
To interact with the Polygon Mumbai EVM chain, it is recommended to use the RPC server at the following address: https://rpc.ankr.com/polygon_mumbai.
Test Matic coins can be obtained from the website: https://mumbaifaucet.com/.

- Useful links
https://www.alchemy.com/nft-api
https://www.quicknode.com/docs/ethereum/eth_getCode

## Github Actions

The project is configured to use Github Actions. 
The configuration file for autorun is `.github/workflows/ci.yml`.
The configuration file for manual run is `.github/workflows/manual.yml`.
Environment variables are set via Secrets.
Image for Manual workflow sets via Githun Actions => Manual Workflow => Run Workflow 

Example value for Ports for image backend `4000:4000`
Example value for Docker image backend `evercoinx/faraway:nft-collection-deployer-backend`

Autorun of CI is configured to start with every push into the `main`

## Local installation

Make sure you have Node.js and npm installed. [Node.js and npm download link](https://nodejs.org/en/download/).

Clone the repository and install dependencies using npm:

```bash
git clone https://github.com/ksenia-ekshova/nft-tests.git
cd nft-tests
npm install
```

## Local run

Before running tests, set up environment variables. Create a `.env` file and add the following variables to it:

```env
MORALIS_API_KEY=<your-moralis-api-key>
API_KEY=<your-api-key>
PRIVATE_KEY=<private-key-of-bank-account>
```

Run tests using commands:

```bash
npm test/npx mocha
```


