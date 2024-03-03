const ethers = require('ethers');
const axios = require('axios');
//const { expect } = require('chai');
const expect = chai.expect;
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "collection",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            }
        ],
        "name": "CollectionCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "version",
                "type": "uint8"
            }
        ],
        "name": "Initialized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "collection",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "tokenURI",
                "type": "string"
            }
        ],
        "name": "TokenMinted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "baseURI",
                "type": "string"
            }
        ],
        "name": "deployCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract Collection",
                "name": "collection",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
//function to generate random collection name
function collectionNameGenerator(name) {
    return name + Math.floor(Math.random() * 1000);
}

const appBasicUrl = "http://localhost:4000";

const privateKey = "0x6873e71fe948456e95b66ae792edb3b6661034883d03d20753cb30f0a93752cc";//нужно вынести в env.,т.к. нельзя светить приватным ключем, но для тестового я оставила
const apiKey = "https://polygon-mumbai.infura.io/v3/10995041f5554e5a995b09ab15d001f7";
const contractAddress = "0x54EEDe47850fE932f5466B6fa708bf1176371966"; 
const recipient = "0x6df3512b9ddb013ca5c1fa28C7af372858D2A257";
const tokenId = 0;

const collectionName = collectionNameGenerator("TestName");
const collectionSymbol = "TST";
const collectionBaseURI = "ipfs://QmbeT7zTp5nFbg4BzZJMKT1Ck71MxxXix4oBTr7GzRWKL6/";
let collectionAddress = "";
let collectionContract = "";

const provider = new ethers.providers.JsonRpcProvider(apiKey);
const wallet = new ethers.Wallet(privateKey, provider); 
const contract = new ethers.Contract(contractAddress, contractABI, wallet);


describe('NFT collection tests', () => {
    it('Should create a new NFT collection', async () => {
        const tx = await contract.deployCollection(collectionName, collectionSymbol, collectionBaseURI);
        const receipt = await tx.wait();
        const event = receipt.events[0];
        const args = event.args;
        collectionAddress = args.collection;//точно так?
        collectionContract = new ethers.Contract(collectionAddress, contractABI, wallet);
        expect(args.name).to.equal(collectionName);
        expect(args.symbol).to.equal(collectionSymbol);
        expect(args.owner).to.equal(recipient);
        //проверяем, что записывается в event
    });
    it('Shoud have the same name, symbol, baseURI and owner from the contract via rpc api', async () => {
        const name = await collectionContract.name();
        const symbol = await collectionContract.symbol();
        const baseURI = await collectionContract.baseURI();
        const owner = await collectionContract.owner();
        expect(name).to.equal(collectionName);
        expect(symbol).to.equal(collectionSymbol);
        expect(baseURI).to.equal(collectionBaseURI);
        expect (owner).to.equal(recipient);
    });
    it('Shoud have the same name, symbol, baseURI and owner from the app backend', async () => {
        axios.get(appBasicUrl + '/event/')
            .then(function (response) {
            // проверьте статус ответа
        if(response.status === 200){
        let data = response.data[response.data.length - 1];//check only for the last object
        console.log(lastObject);
        }
    })
        .catch(function (error) {
        console.log(error);
  })
        expect(data.name).to.equal(collectionName);
        expect(data.symbol).to.equal(collectionSymbol);
        expect(data.baseURI).to.equal(collectionBaseURI);
        expect(data.owner).to.equal(recipient);
    });
    it('Should mint a new NFT', async () => {
        const tx = await collectionContract.mint(recipient, tokenId);
        const receipt = await tx.wait();
        const event = receipt.events[0];
        const args = event.args;
        expect(args.recipient).to.equal(recipient);
        expect(args.tokenId).to.equal(tokenId);
        expect(args.tokenURI).to.equal(collectionBaseURI + args.tokenId);
    });
    it('Should have the same balance from the contract via rpc api', async () => {
        const balance = await collectionContract.balanceOf(recipient);
        expect(balance).to.equal(1);
    });
    it('Should have the same recipient, tokenId and tokenURI from the contract via rpc api', async () => {
        const tokenURI = await collectionContract.tokenURI(tokenId);
        expect(tokenURI).to.equal(collectionBaseURI + tokenId);
    });
    it('Should have the same recipient, tokenId and tokenURI from the app backend', async () => {
        axios.get(appBasicUrl + '/event/')
            .then(function (response) {
            // проверьте статус ответа
        if(response.status === 200){
        let data = response.data[response.data.length - 1];//check only for the last object
        console.log(data);
        }
    })
        .catch(function (error) {
        console.log(error);
    })
        expect(data.recipient).to.equal(recipient);
        expect(data.tokenId).to.equal(tokenId);
        expect(data.tokenURI).to.equal(collectionBaseURI + tokenId);
    });

});
        

it('Should have name "Pixel Cats"', async () => {
    
    for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {

      const response = await Moralis.EvmApi.nft.getNFTMetadata({
        address,
        chain,
        tokenId,
      });
    
    const data = response.toJSON();
    expect(data).to.include({ name: "Pixel cats" });
    console.log (data.name);
    }
  });
