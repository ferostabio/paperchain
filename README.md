# Paperchain

Project made for **CryptoDevs** course on *blockchain* and *smart contract* development organized by **ONG Bitcoin Argentina**, **ATIX LABS** and **RSK**. Code setup taken from a couple of truffle boxes, namely *react-auth-box* in order to have an out of the box auth system and to take advantage of redux’s global states.

## Project

Paperchain is a dApp to keep track of scientific papers: users have to sign up with their name and field of work and can then upload documents, stored in a descentralized way with IPFS, as long as they are new (app includes POE). Users can also specify quoted papers during the document registration process and can peer-review existing papers, as long as they have the same “field”.

### Disclaimer

This is the first web front-end i’ve done in ages, though, so i also took it as an opportunity to learn a little bit on webpack, react and redux. That beind said, and with time being a limited asset, i didn’t focus much on front-end (so code might not be as reduxy as it should, be slightly inconsistent at some points).

## Installation

1. Install Truffle globally.
```javascript
    npm install -g truffle
```

2. Download the code or clone the repo, go to it’s root folder and install all dependencies.
```javascript
    npm install
```

3. Now compile and migrate the smart contracts. You can of corse enter the development console by typing `truffle develop` and all of the Truffle related commands will be entered without having to actually type `truffle`.
```javascript
    truffle compile
    truffle migrate
```

4. And test (all tests were written in *JavaScript*)
```javascript
    truffle test
```

## Web app

Run the `webpack` server in localhost (smart contract changes must be manually recompiled and migrated)
```javascript
    npm run start
```

## Ganache

To run the dapp locally, install `ganache-cli` (formerly known as *EthereumJS-TestRPC*)
```javascript
    npm install -g ganache-cli
```

And fire up the personal blockchain (do it before deploying contracts; if there's nowhere to deploy, `migrate` will fail)
```javascript
    ganache-cli
```
