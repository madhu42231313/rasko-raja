var CryptoJS = require("crypto-js");
var axios = require('axios')
const privateKey = 'P@$$wordRASKOR@J@'
const openAIKey = 'sk-gnpHgNlj1nyLOIPUJShUjPkllzh19Tktx3e6eHpV'
const engine = 'davinci'
const completionUrl = `https://api.openai.com/v1/engines/${engine}/completions`

module.exports = {

    decryptData: function (data) {

        try {
            const bytes = CryptoJS.AES.decrypt(data, privateKey);
            if (bytes.toString()) {
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            }
            return data;
        } catch (e) {
            console.log(e);
        }
    },

    fetch: (api_req, api_res) => {
        if (api_req) {
            // console.log('api req ',api_req && api_req.body)

            let ciphertext = api_req && api_req.body && api_req.body.reqOptions
            let reqOptions = module.exports.decryptData(ciphertext);
            if (reqOptions) {
                console.log('reqOptions ', reqOptions)
                let instance = axios.create({
                    headers: {
                        'Authorization': `Bearer ${openAIKey}`,
                        'Content-Type': 'application/json'
                    }
                })
                console.log("url ", completionUrl)
                let response = instance.post(completionUrl, reqOptions)
                response.then((res) => {
                    console.log('response ', res)
                    api_res.status(200).send(res && res.data || null);
                }).catch(
                    (e) => {
                        console.error(e),
                        api_res.status(500).send(e)
                    })
            }

            return api_res
        }
    }
}