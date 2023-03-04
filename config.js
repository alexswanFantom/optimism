const ora = require('ora');
const fs = require('fs');
require('dotenv').config();
const https = require('https');
const axios = require('axios');
axios.defaults.withCredentials = true;
const ethers = require("ethers");
const ABI = JSON.parse(process.env.ABI)
const WETH_ABI = JSON.parse(process.env.WETHABI)

const proxy = { protocol: 'http',host: 'p.webshare.io',port: 80,auth: { username: process.env.username,password: process.env.password } };

const color = {
  BLACK: "\u001b[30m",
  RED: "\u001b[31m",
  GREEN: "\u001b[32m",
  YELLOW: "\u001b[33m",
  BLUE: "\u001b[34m",
  MAGENTA: "\u001b[35m",
  CYAN: "\u001b[36m",
  WHITE: "\u001b[37m",
  RESET: "\u001b[0m",
};

async function animations(tokenName) {
  return new ora(`${color.YELLOW}Swaping token ${tokenName}... ${color.RESET}`).start()
}

async function createWalletAddress() {
  try {
    const mnemonic = await ethers.utils.entropyToMnemonic(
      ethers.utils.randomBytes(16)); const wallet = ethers.Wallet.fromMnemonic(mnemonic); const data = { address: wallet.address, privateKey: wallet.privateKey, mnemonic: mnemonic, };
    return data;
  } catch (err) {
    console.log(err);
  }
}
const animation = {
  Loading: new ora(color.CYAN + "Loading create wallet...\n" + color.RESET),
  Waiting: new ora(
    color.CYAN + "Waiting connect to Faucet...\n" + color.RESET
  ),
  Claiming: new ora(color.CYAN + "Prepare claim faucet...\n" + color.RESET),
  Faucet: new ora(color.CYAN + "Start to claim Faucet..." + color.RESET),
  SendETH: new ora(color.CYAN + "Waiting for sending ETH...\n" + color.RESET),
};

async function appendFile(wallet) {
  fs.appendFile('./database/privateKey.txt', `${wallet.privateKey}\n`, (e) => {
    if (e) throw e;
  });
  fs.appendFile('./database/mnemonic.txt', `${wallet.mnemonic}\n`, (e) => {
    if (e) throw e;
  });
}

const rpc = "https://goerli.optimism.io";

module.exports = { color, animation, animations, createWalletAddress, proxy, ABI, WETH_ABI, rpc, appendFile}