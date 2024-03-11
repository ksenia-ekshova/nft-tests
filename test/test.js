const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');
const config = require('../config.js');
const { expect } = require('chai');
const { describe, it } = require('mocha');
require('dotenv').config()

const { createNewWallet, transferTokensFromBankToWallet, collectionNameGenerator, getLastEventFromAPI, createCollection, mintNFT } = require('../utils.js');

const moralisApiKey = process.env.MORALIS_API_KEY;
const contractAddress = config.contractAddress;
const chain = EvmChain.MUMBAI;

const collectionName = collectionNameGenerator('TestName');
const collectionSymbol = 'TST';
const URI = config.pixelCatsURI;
const collectionBaseURI = `ipfs://${URI}/`; //made to check by part of the URI, because Moralis converts the returned URI

const tokenId = 0;

const eventCollectionCreatedTopic = '0x3454b57f2dca4f5a54e8358d096ac9d1a0d2dab98991ddb89ff9ea1746260617';
const eventNFTMintedTopic = '0xc9fee7cd4889f66f10ff8117316524260a5242e88e25e0656dfb3f4196a21917';

const eventCollectionCreatedABI = {
    'anonymous': false,
    'inputs': [{
            'indexed': false,
            'name': 'collection',
            'type': 'address',
            'internal_type': 'address'
        },
        {
            'indexed': false,
            'name': 'name',
            'type': 'string',
            'internal_type': 'string'
        },
        {
            'indexed': false,
            'name': 'symbol',
            'type': 'string',
            'internal_type': 'string'
        }
    ],
    'name': 'CollectionCreated',
    'type': 'event'
};

const eventNFTMintedABI = {
    'anonymous': false,
    'inputs': [{
            'indexed': false,
            'internalType': 'address',
            'name': 'collection',
            'type': 'address'
        },
        {
            'indexed': false,
            'internalType': 'address',
            'name': 'recipient',
            'type': 'address'
        },
        {
            'indexed': false,
            'internalType': 'uint256',
            'name': 'tokenId',
            'type': 'uint256'
        },
        {
            'indexed': false,
            'internalType': 'string',
            'name': 'tokenURI',
            'type': 'string'
        }
    ],
    'name': 'TokenMinted',
    'type': 'event'
}

let owner = '';
let collectionAddress = '';

describe('NFT collection tests', async function() {
    this.retries(2); //failed tests are restarted

    before(async function() {
        try {
            // create preconditions - new wallet, transfer tokens from bank to wallet, create collection, mint NFT
            const newWallet = createNewWallet();
            owner = newWallet.address;
            await transferTokensFromBankToWallet(newWallet);
            collectionAddress = await createCollection(collectionName, collectionSymbol, collectionBaseURI);
            await mintNFT(collectionAddress, owner, tokenId);

            //start Moralis
            await Moralis.start({
                apiKey: moralisApiKey
            });

        } catch (e) {
            throw e; //stop tests if preconditions are not met
        }
    });

    it(`Should have CollectionCreated event`, async function() {
        const response = await Moralis.EvmApi.events.getContractEvents({
            'chain': chain,
            'topic': eventCollectionCreatedTopic,
            'order': 'DESC',
            'limit': 1,
            'address': contractAddress,
            'abi': eventCollectionCreatedABI
        });
        const data = response.raw.result[0].data;
        // console.log(data.collection, data.name, data.symbol);
        expect(data.collection).to.equal(collectionAddress.toLowerCase());
        expect(data.name).to.equal(collectionName);
        expect(data.symbol).to.equal(collectionSymbol);
    });

    it(`Should have ${collectionName} name, ${collectionSymbol} symbol by Collection`, function(done) {
        const collection = ((collectionAddress).toString());
        Moralis.EvmApi.nft.getNFTContractMetadata({
            'chain': chain,
            'address': collection
        }).then(function(response) {
            const data = response.raw;
            expect(data.name).to.equal(collectionName);
            expect(data.symbol).to.equal(collectionSymbol);
            done();
        }).catch(function(err) {
            done(err);
        });
    });

    it(`Should have NFTMinted event`, async function() {
        const response = await Moralis.EvmApi.events.getContractEvents({
            'chain': chain,
            'topic': eventNFTMintedTopic,
            'order': 'DESC',
            'limit': 1,
            'address': contractAddress,
            'abi': eventNFTMintedABI
        });
        const data = response.raw.result[0].data;
        expect(data.recipient).to.equal(owner.toLowerCase());
        expect(data.tokenId).to.equal(tokenId.toString());
        expect(data.tokenURI).includes(`${URI}/${tokenId}`);
    });

    it(`Should transfer NFT to owner wallet`, async function() {
        const response = await Moralis.EvmApi.nft.getNFTContractTransfers({
            'chain': chain,
            'format': 'decimal',
            'limit': 1,
            'order': 'DESC',
            'address': collectionAddress
        });

        const data = response.raw.result[0];
        //console.log(data);
        expect(data.to_address).to.equal(owner.toLowerCase());
        expect(data.token_id).to.equal(tokenId.toString());
    });

    it(`Should have ${collectionBaseURI}${tokenId} tokenURI and owner`, function(done) {
        const collection = ((collectionAddress).toString());
        Moralis.EvmApi.nft.getNFTMetadata({
            'chain': chain,
            'format': 'decimal', 
            'address': collection, 
            'tokenId': tokenId
        }).then(function(response) {
            setTimeout(function() {
                const data = response.raw;
                //console.log('getNFTMetadata ', data);
                expect(data.owner_of).to.equal(owner.toLowerCase());
                expect(data.name).to.equal(collectionName);
                expect(data.symbol).to.equal(collectionSymbol);
                expect(data.token_uri).includes(`${URI}/${tokenId}`);
                expect(data.token_id).to.equal(tokenId.toString());
                done();
            }, 5000);// timeout for Moralis to update the data
        })
        .catch(function(err) {
            done(err);
        });
    });

    it(`Should have ${collectionName} name, ${collectionSymbol} symbol and ${collectionAddress} collection address from the app backend for CollectionCreated event`, async function() {
        const data = await getLastEventFromAPI('CollectionCreated');
        //console.log(data);
        expect(data.collection).to.equal(collectionAddress); 
        expect(data.name).to.equal(collectionName);
        expect(data.symbol).to.equal(collectionSymbol);
    });

    it(`Should have ${collectionAddress} collection address, ${owner} owner, ${tokenId} token Id and ${collectionBaseURI + collectionTokenId} URI from the app backend for TokenMinted event`, async function() {
        const data = await getLastEventFromAPI('TokenMinted');
        //console.log(data);
        expect(data.collection).to.equal(collectionAddress); 
        expect(data.recipient).to.equal(owner);
        expect(data.tokenId).to.equal(tokenId);
        expect(data.tokenURI).to.equal(collectionBaseURI + collectionTokenId);
    });
});