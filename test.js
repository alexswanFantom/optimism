const tor_axios = require('tor-axios');
var { SocksProxyAgent } = require('socks-proxy-agent');
const axios = require('axios');
const tor = tor_axios.torSetup({
  ip: 'localhost',
  port: 9050,
  controlPort: '9051',
  controlPassword: 'giraffe',
})
//const result = await axios.post(url, bodyFormData, { headers: bodyFormData.getHeaders(), agent: httpsAgent });
const client = axios.create({
  httpAgent: tor.httpAgent(),
  httpsagent: tor.httpsAgent(),
});
const url = 'https://beta-faucet-service.avt.trade/airdropOpAvt';
const address = '0x18899a68Cf954f47c90698eaB3523aFdEb5E3CAF';
const FormData = require("form-data");
var bodyFormData = new FormData();
bodyFormData.append("address", address);
tor.post(url, bodyFormData, { headers: bodyFormData.getHeaders() }).then(res => console.log(res.data));

// (async () => {
//   await tor.torNewSession(); //change tor ip
//   response = await tor.get('http://api.ipify.org');
//   ip = response.data;
//   console.log(ip);
// })()