require('dotenv').config()
const contractABI = require('./contractABI.js');
const ethers = require('ethers');
const axios = require('axios');
const config = require('./config.js');

let contract;
let newWallet;
let provider;

const appBasicUrl = config.appBasicUrlBackend;

//function for creating new wallet
function createNewWallet() {
    try {
        const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
        //console.log('New wallet Mnemonic:', mnemonic);
        newWallet = ethers.Wallet.fromMnemonic(mnemonic);
        console.log('New wallet address:', newWallet.address)
        //console.log('New wallet private key:', newWallet.privateKey)

        provider = new ethers.providers.JsonRpcProvider(process.env.API_KEY);
        const wallet = new ethers.Wallet(newWallet.privateKey, provider);
        contract = new ethers.Contract(config.contractAddress, contractABI, wallet);

        return wallet;
    } catch (error) {
        console.error('Error with creating wallet: ', error.message);
        throw error;
    }
}

async function transferTokensFromBankToWallet(wallet) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(process.env.API_KEY);
        const walletFrom = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const toAddress = wallet.address;

        const amount = ethers.utils.parseUnits('0.005', 'ether'); //without exact calculation
        const gasLimit = ethers.BigNumber.from('21000');
        const gasPrice = await provider.getGasPrice();

        //create transaction
        const transaction = {
            to: toAddress,
            value: amount,
            gasLimit: gasLimit,
            gasPrice: gasPrice
        };

        const tx = await walletFrom.sendTransaction(transaction);
        //console.log('Transaction sent:', tx.hash)
        //waiting for transaction to be included in a block
        await tx.wait();

        const balance = ethers.utils.formatEther(await provider.getBalance(wallet.address));

        console.log('Recipient wallet balance:', balance);
    } catch (error) {
        console.error('Error with transfer tokens: ', error.message);
        throw error;
    }
}

//function to generate random collection name
function collectionNameGenerator(name) {
    return (name + Math.floor(Math.random() * 1000));
}

//function for getting last Event with target name from backend
async function getLastEventFromAPI(eventName) {
    try {
        const response = await axios.get(appBasicUrl + '/events/');
        // Filter the array for events of a specific name, and get the last
        const filteredEvents = response.data.filter(event => event.eventName === eventName);
        //console.log("filteredEvents ", filteredEvents);
        const lastEvent = filteredEvents[filteredEvents.length - 1];
        //console.log("lastEvent ", lastEvent);
        if (!lastEvent) {
            throw new Error(`No event with the name ${eventName} found`);
        }

        return lastEvent;
    } catch (error) {
        console.error('Error with fetching data from API: ', error.message);
        throw error;
    }
}

async function createCollection(collectionName, collectionSymbol, collectionBaseURI) {
    try {
        const tx = await contract.deployCollection(collectionName, collectionSymbol, collectionBaseURI);
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === 'CollectionCreated');

        if (!event) {
            throw new Error('CollectionCreated event not found');
        }
        const {
            collection,
            name,
            symbol
        } = event.args;

        console.log('Collection created:', collection, name, symbol);
        collectionAddress = (collection.toString());
        console.log('Collection address:', collectionAddress);
        return collectionAddress;

    } catch (error) {
        console.error('Error with fetching data: ', error.message);
        throw error;
    }
}

async function mintNFT(collectionAddress, collectionRecipient, collectionTokenId) {
    try {
        const tx = await contract.mint(collectionAddress, collectionRecipient, collectionTokenId);
        const receipt = await tx.wait();
        const event = receipt.events.find(e => e.event === 'TokenMinted');

        if (!event) {
            throw new Error('TokenMinted event not found');
        }

        const {
            collection,
            recipient,
            tokenId,
            tokenURI
        } = event.args;
        console.log('NFT minted:', collection, recipient, tokenId, tokenURI);
    } catch (error) {
        console.error('Error with fetching data: ', error.message);
        throw error;
    }
}

module.exports = { createNewWallet, transferTokensFromBankToWallet, collectionNameGenerator, getLastEventFromAPI, createCollection, mintNFT };