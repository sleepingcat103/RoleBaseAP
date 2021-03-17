const axios = require('axios');
var { parseString } = require('xml2js');
const config = require("../config/configRouter");

class ldapService {

  authenticate(Acnt, Pwd) {
    
    const { ADChkUrl, svrAD, Domain } = config.ldapService;
    const params = new URLSearchParams();

    params.append('svrAD', svrAD);
    params.append('Domain', Domain);
    params.append('Acnt', Acnt);
    params.append('Pwd', Pwd);

    /**取得ad驗證結果 */
    return axios.post(ADChkUrl, params)
    .then(response => {

      console.log('[VARIFY AD]', response);
      /**解析驗證結果XML */
      var xml = response.data;

      return new Promise((resolve, reject) => {
        parseString(xml, function (err, result) {
          if(err) reject(err);
          
          resolve(result.boolean._ == 'true' || result.boolean._ == true);
        });
      })
    })
  } 

}
module.exports = new ldapService();