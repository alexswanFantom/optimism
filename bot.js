const func = require('./func');
const cfg = require('./config');
const ora = require('ora');
const FormData = require("form-data");
require('dotenv').config();
const tor_axios = require('tor-axios');

const contract = ['0xc5D8d1002A9674E41942e3eaeaC41afD74fD557a', '0x66469d9c9137b52D4efA75A6122DacAF35922136', '0xA8B4FBacE6B464f32daAf53b2b86dC91122194CB', '0xdac73bbC7AB317b64fD38dc1490FB33264facb4B',
  '0xb9b5D39eC0a9996Ec0d92f2fcF6C8B51A51B2d57'];
const symbol = ['USDC', 'USDT', 'DAI', 'BTC', 'WETH'];

const acc = process.env.address.substring(0, 5);
const acc2 = process.env.address.substring(37, 42);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const starts = new ora(`${cfg.color.CYAN}Loading scripts...${cfg.color.RESET}`);
const prepare = new ora(`${cfg.color.CYAN}Prepare to claim faucet...${cfg.color.RESET}`);
const create = new ora(`${cfg.color.CYAN}Creating wallet address...${cfg.color.RESET}`);

async function claim() {
  try {
    console.clear();
    starts.start();
    await sleep(3000);
    starts.stop();
    await sleep(500);
    create.start();
    await sleep(3000);
    const wallet = await cfg.createWalletAddress();
    create.stop();
    console.log(`✓ Address: ${cfg.color.YELLOW}${wallet.address}${cfg.color.RESET}`);
    await sleep(500);
    prepare.start();
    await sleep(3000);
    prepare.stop();
    var bodyFormData = new FormData();
    bodyFormData.append("address", wallet.address);
    const url = 'https://beta-faucet-service.avt.trade/airdropOpAvt';

    const faucet = async (callback) => {
      const tor = tor_axios.torSetup({ ip: 'localhost', port: 9050, controlPort: '9051', controlPassword: 'giraffe', });
      try {
        const result = await tor.post(url, bodyFormData, { headers: bodyFormData.getHeaders() });
        callback(result.data);
      } catch (err) {
        try {
          callback(e.response.data)
        } catch (err) {
          await tor.torNewSession();
          await sleep(3000);
          await claim();
        }
      }
    }

    faucet(async (result) => {
      if (result.code === 200) {
        const add = wallet.address.substring(0, 5);
        const add2 = wallet.address.substring(37, 42);
        console.log(`✓ ${cfg.color.YELLOW}${add}...${add2}${cfg.color.RESET} ${cfg.color.GREEN}successfully claim faucet.${cfg.color.RESET}`);
        await cfg.appendFile(wallet);
        const praSendEth = new ora(`${cfg.color.CYAN}Sending ETH to${cfg.color.RESET} ${cfg.color.YELLOW}${add}...${add2}${cfg.color.RESET}`);
        praSendEth.start();
        const sendETH = await func.sendETH(wallet.address);
        if (sendETH) {
          await sleep(3000);
          praSendEth.stop();
          console.log(`✓ ${cfg.color.GREEN}Successfully send ETH to${cfg.color.RESET} ${cfg.color.YELLOW}${add}...${add2}${cfg.color.RESET}`);
          for (let i = 0; i < contract.length; i++) {
            const praSendToken = new ora(`${cfg.color.CYAN}Waiting for sending ${symbol[i]} to${cfg.color.RESET} ${cfg.color.YELLOW}${acc}...${acc2}${cfg.color.RESET}`);
            praSendToken.start();
            const user = { contract: contract[i], address: wallet.address, privateKey: wallet.privateKey };
            const sendToken = await func.sendToken(user);
            if (sendToken) {
              await sleep(3000);
              praSendToken.stop();
              console.log(`✓ ${cfg.color.GREEN}Successfully send ${symbol[i]} to${cfg.color.RESET} ${cfg.color.YELLOW}${acc}...${acc2}${cfg.color.RESET}`);
            } else {
              await sleep(3000);
              praSendToken.stop();
              console.log(`❌${cfg.color.RED}Failed send ${symbol[i]} to${cfg.color.RESET} ${cfg.color.YELLOW}${acc}...${acc2}${cfg.color.RESET}`);
            }
          }
          await sleep(1000);
          const praSendEthTo = new ora(`${cfg.color.CYAN}Waiting for sending ETH to${cfg.color.RESET} ${cfg.color.YELLOW}${acc}...${acc2}${cfg.color.RESET}`);
          praSendEthTo.start();
          const sendTowallet = await func.sendingETH(wallet);
          if (sendTowallet) {
            await sleep(3000);
            praSendEthTo.stop();
            console.log(`✓ ${cfg.color.GREEN}Successfully send ETH to ${cfg.color.RESET} ${cfg.color.YELLOW}${acc}...${acc2}${cfg.color.RESET}`);
          } else {
            await sleep(3000);
            praSendEthTo.stop();
            console.log(`❌${cfg.color.RED}Failed send ETH to${cfg.color.RESET} ${cfg.color.YELLOW}${acc}...${acc2}${cfg.color.RESET}`);
          }
          const available = await func.getWETHavailable() / 1e18;
          if (available > 0) {
            const praWrap = new ora(`${cfg.color.CYAN}Waiting for wrap${cfg.color.RESET} ${available} ${cfg.color.CYAN}WETH to ETH${cfg.color.RESET}`);
            praWrap.start();
            await sleep(3000);
            const sendWETH = await func.wrapWETH();
            if (sendWETH) {
              praWrap.stop()
              console.log(`✓ ${cfg.color.GREEN}Success wrap${cfg.color.RESET} ${available} ${cfg.color.GREEN}WETH to ETH.${cfg.color.RESET}`);
              await sleep(1000);
              await claim();
            } else {
              praWrap.stop()
              console.log(`❌${cfg.color.RED}Failed wrap${cfg.color.RESET} ${available} ${cfg.color.RED}WETH to ETH.${cfg.color.RESET}`);
              await sleep(1000);
              await claim();
            }
          } else {
            await sleep(1000);
            await claim();
          }
        } else {
          await sleep(3000);
          praSendEth.stop();
          console.log(`❌${cfg.color.RED}Failed send ETH to${cfg.color.RESET} ${cfg.color.YELLOW}${add}...${add2}${cfg.color.RESET}`);
        }
      } else if (result.code === 1 || result.code === 2) {
        await sleep(2000);
        console.log('❌' + cfg.color.RED + '' + result.msg + '' + cfg.color.RESET);
        const tor = tor_axios.torSetup({ ip: 'localhost', port: 9050, controlPort: '9051', controlPassword: 'giraffe', });
        await tor.torNewSession();
        await claim();
      }
    });
  } catch (err) {
    await claim();
  }
}


async function main() {
  try {
    const tor = tor_axios.torSetup({ ip: 'localhost', port: 9050, controlPort: '9051', controlPassword: 'giraffe', });
    await tor.torNewSession();
    await claim();
  } catch (err) {
    await tor.torNewSession();
    await claim();
  }
}

main()
