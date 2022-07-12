const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Reverso = require('reverso-api');
const dev_config = (process.env.vercel === undefined) ? require('../devConfig') : undefined;

const reverso = new Reverso()


const singleTrans = async (req, res) => {
    if (req.body?.single) {

        // api docs : https://docs.microsoft.com/en-us/azure/cognitive-services/Translator/quickstart-translator?tabs=nodejs#transliterate-text
        let azureApi = `https://api.cognitive.microsofttranslator.com`;

        const single = req.body.single;
        const azure_translate_api = process.env.azureTranslateApi || dev_config.azureTranslateApi;

        axios({
            baseURL: azureApi,
            url: '/dictionary/lookup',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': azure_translate_api,
                'Ocp-Apim-Subscription-Region': 'global',
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params: {
                'api-version': '3.0',
                'from': 'en',
                'to': ['he']
            },
            data: [{
                'text': single
            }],
            responseType: 'json'
        }).then(function (response) {
            let results = [];
            response.data[0].translations.forEach(element => {
                results.push(element.normalizedTarget);
            });
            res.send({ results: results });
        })
    }else{
        throw new Error('No word to translate');
    }
}

const lineTrans = async (req, res) => {
    if (req.body?.lines) {

        let lines = [];
        req.body.lines.map((li) => {
            lines.push({
                'text': decodeURI(li.src)
            })
        });

        try {
            let azureApi = `https://api.cognitive.microsofttranslator.com`;

            const azure_translate_api = process.env.azureTranslateApi || dev_config.azureTranslateApi;
            // https://portal.azure.com/#home // manage apps

            axios({
                baseURL: azureApi,
                url: '/translate',
                method: 'post',
                headers: {
                    'Ocp-Apim-Subscription-Key': azure_translate_api,
                    'Ocp-Apim-Subscription-Region': 'global',
                    'Content-type': 'application/json',
                    'X-ClientTraceId': uuidv4().toString()
                },
                params: {
                    'api-version': '3.0',
                    'from': 'en',
                    'to': ['he']
                },
                data: lines,
                responseType: 'json'
            }).then(function (response) {
                let results = [];
                if (response.data[0].translations[0]) {
                    response.data.map((y) => {
                        results.push(y.translations[0].text)
                    });
                    res.send({ trans: results });
                } else {
                    res.send('translation faild for lines')
                }
            }).catch((err) => {
                res.send('translation faild for lines')
                console.error(err);
            });
        } catch {
            try {
                reverso.getTranslation(decodeURI(req.body.lines), 'English', 'Hebrew', (response) => {
                    if (response.translation[0]) {
                        res.send({ trans: response.translation[0] });
                    } else {
                        res.send('translation faild for: ' + req.body.lines)
                    }

                }).catch((err) => {
                    res.send('translation faild for: ' + req.body.lines)
                    console.error(err);
                });
            } catch {
                res.status(500).send('r api error');
            }
        }
    }
};

const singleLineTrans = (req, res, next) => {
    try {
        //reverso Max chars in once - 2,000
        reverso.getTranslation(decodeURI(req.body.line), 'English', 'Hebrew', (response) => {

            if (response.translation[0]) {
                res.send({ trans: response.translation[0] });
            } else {
                reverso.getTranslation(decodeURI(req.body.line), 'English', 'Hebrew', (response) => {
                    if (response.translation[0]) {
                        res.send({ trans: response.translation[0] });
                    } else {
                        res.send('translation faild for: ' + req.body.line)
                    }

                }).catch((err) => {
                    res.send('translation faild for: ' + req.body.line)
                    console.error(err);
                });
            }

        }).catch((err) => {
            reverso.getTranslation(decodeURI(req.body.line), 'English', 'Hebrew', (response) => {
                if (response.translation[0]) {
                    res.send({ trans: response.translation[0] });
                } else {
                    res.send('translation faild for: ' + req.body.line)
                }
            }).catch((err) => {
                res.send('translation faild for: ' + req.body.line)
                console.error(err);
            });
        });
    } catch {
        res.status(500).send('r api error');
    }
};

module.exports = { singleTrans, singleLineTrans, lineTrans };