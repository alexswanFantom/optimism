const provider = require('web3');
const ethers = require('ethers');
const cfg = require('./config');
require('dotenv').config();
const account = new ethers.Wallet(process.env.privateKey);

async function getTokenBalance(_address, _contract) {
  const web3 = new provider(cfg.rpc);
  const _cAddress = web3.utils.toChecksumAddress(_contract);
  const address = web3.utils.toChecksumAddress(_address);
  let balance = 0;
  try {
    const contract = new web3.eth.Contract(cfg.ABI, _cAddress);
    const sub = await contract.methods.balanceOf(address).call();
    balance = sub;
    return balance;
  } catch (err) {
    const contract = new web3.eth.Contract(cfg.ABI, _cAddress);
    const sub = await contract.methods.balanceOf(address).call();
    balance = sub;
    return balance;
  }
}

async function getWETHavailable() {
  const web3 = new provider(cfg.rpc);
  const _cAddress = web3.utils.toChecksumAddress(process.env.WETH);
  let available = 0;
  try {
    const contract = new web3.eth.Contract(cfg.ABI, _cAddress);
    const sub = await contract.methods.totalSupply().call();
    available = sub;
    return available;
  } catch (e) {
    const contract = new web3.eth.Contract(cfg.ABI, _cAddress);
    const sub = await contract.methods.totalSupply().call();
    available = sub;
    return available;
  }
}

async function getETHbalance(address) {
  const web3 = new provider(cfg.rpc);
  let balance = 0;
  try {
    const sub = await web3.eth.getBalance(address);
    balance = sub;
    return balance;
  } catch (err) {
    const sub = await web3.eth.getBalance(address);
    balance = sub;
    return balance;
  }
}

async function approveToken(_address, _privateKey, _contract) {
  const web3 = new provider(cfg.rpc);
  const _cAddress = web3.utils.toChecksumAddress(_contract);
  const address = web3.utils.toChecksumAddress(_address);
  const router = web3.utils.toChecksumAddress(process.env.router);
  const contract = new web3.eth.Contract(cfg.ABI, _cAddress);
  const logs = await contract.methods.approve(router, process.env.uint256).encodeABI();
  const transaction = {
    to: _cAddress,
    value: 0,
    gasLimit: web3.utils.toHex(210000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
    data: logs
  };
  let status = false;
  try {
    const signTx = await web3.eth.accounts.signTransaction(transaction, _privateKey);
    const result = await web3.eth.sendSignedTransaction(signTx.rawTransaction);
    status = result.status;
    return status;
  } catch (err) {
    const transaction = {
      to: _cAddress,
      value: 0,
      gasLimit: web3.utils.toHex(210000),
      gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
      data: logs
    };
    const signTx = await web3.eth.accounts.signTransaction(transaction, _privateKey);
    const result = await web3.eth.sendSignedTransaction(signTx.rawTransaction);
    status = result.status;
    return status;
  }
}

async function swatTokeToWETH(wallet) {
  const web3 = new provider(cfg.rpc);
  const _contract = web3.utils.toChecksumAddress(wallet.contract);
  const address = web3.utils.toChecksumAddress(wallet.address);
  const router = web3.utils.toChecksumAddress(process.env.router);
  let status = false
  try {
    const tokenBalance = await getTokenBalance(address, _contract);
    if (tokenBalance > 0) {
      const approve = await approveToken(address, wallet.privateKey, _contract);
      if (approve) {
        const contract = new web3.eth.Contract(cfg.ABI, router);
        const logs = await contract.methods.swap([`${_contract}`, `${web3.utils.toChecksumAddress(process.env.WETH)}`], `${tokenBalance}`, 0, account.address).encodeABI();
        const transaction = {
          from: address,
          to: router,
          value: 0,
          gasPrice: web3.utils.toHex('20000000'),
          gasLimit: web3.utils.toHex('3870130'),
          data: logs
        };
        const signTx = await web3.eth.accounts.signTransaction(transaction, wallet.privateKey);
        const result = await web3.eth.sendSignedTransaction(signTx.rawTransaction)
        status = result.status
        return status;
      } else {
        return status;
      }
    } else {
      return status;
    }
  } catch (err) {
    return status;
  }
}

async function sendToken(wallet) {
  const web3 = new provider(cfg.rpc);
  const _contract = web3.utils.toChecksumAddress(wallet.contract);
  const address = web3.utils.toChecksumAddress(wallet.address);
  let status = false;
  try {
    const balance = await getTokenBalance(address, _contract);
    if (balance > 0) {
      const contract = new web3.eth.Contract(cfg.ABI, _contract);
      const logs = await contract.methods.transfer(account.address, balance).encodeABI();
      const tx = {
        to: _contract,
        value: 0,
        gasPrice: web3.utils.toHex('20000000'),
        gasLimit: web3.utils.toHex('3870130'),
        data: logs
      };
      const signTx = await web3.eth.accounts.signTransaction(tx, wallet.privateKey)
      const result = await web3.eth.sendSignedTransaction(signTx.rawTransaction)
      status = result.status;
      return status;
    } else {
      return status;
    }
  } catch (err) {
    return status;
  }
}

async function sendETH(address) {
  let status = false;
  const web3 = new provider(cfg.rpc);
  try {
    const nonce = await web3.eth.getTransactionCount(account.address);
    const amount = web3.utils.toWei('0.015', "ether");
    const rawTransaction = { 'from': web3.utils.toChecksumAddress(account.address), 'to': web3.utils.toChecksumAddress(address), 'value': amount, 'nonce': nonce, 'gasLimit': web3.utils.toHex(220000), 'gasPrice': web3.utils.toHex(5000000000) };
    const sign = await web3.eth.accounts.signTransaction(rawTransaction, process.env.privateKey);
    const result = await web3.eth.sendSignedTransaction(sign.rawTransaction)
    status = result.status;
    return status;
  } catch (e) { return status }
}

async function sendingETH(wallet) {
  let status = false;
  const web3 = new provider(cfg.rpc);
  try {
    const nonce = await web3.eth.getTransactionCount(wallet.address);
    const balance = await web3.eth.getBalance(wallet.address) / 1e18 - 0.001;
    const amount = web3.utils.toWei(balance.toString().substring(0, 5), "ether");
    const rawTransaction = { 'from': web3.utils.toChecksumAddress(wallet.address), 'to': web3.utils.toChecksumAddress(account.address), 'value': amount, 'nonce': nonce, 'gasLimit': web3.utils.toHex(200000), 'gasPrice': web3.utils.toHex(50000000) };
    const sign = await web3.eth.accounts.signTransaction(rawTransaction, wallet.privateKey);
    const result = await web3.eth.sendSignedTransaction(sign.rawTransaction)
    status = result.status;
    return status;
  } catch (err) {
    return status;
  }
}


async function wrapWETH() {
  let status = false;
  const web3 = new provider(cfg.rpc);
  const weth = web3.utils.toChecksumAddress(process.env.WETH)
  try {
    const available = await getWETHavailable();
    const contract = new web3.eth.Contract(cfg.ABI, weth);
    if (available === 0) { return status } else {
      const logs = await contract.methods.withdraw(available).encodeABI();
      const transaction = {
        to: weth,
        value: 0,
        gasPrice: web3.utils.toHex('30000000'),
        gasLimit: web3.utils.toHex('5870130'),
        data: logs
      };

      const signTx = await web3.eth.accounts.signTransaction(transaction, process.env.privateKey)
      const result = await web3.eth.sendSignedTransaction(signTx.rawTransaction)
      status = result.status;
      return status;
    }
  } catch (err) { return status }
}

module.exports = { getTokenBalance, getWETHavailable, getETHbalance, wrapWETH, sendingETH, sendETH, sendToken, swatTokeToWETH } 