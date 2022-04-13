const express = require('express')
const app = express()
const cors = require('cors')

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const Reverso = require('reverso-api');
const reverso = new Reverso();

const dev_config = (process.env.vercel === undefined) ? require('./devConfig') : undefined;

app.use(cors());
app.use(express.json());

function init() {

}
init();

app.get('/', (req, res) => {
    res.status(200).send();
});

app.post('/lyrics', (req, res, next) => {
    let cors = `https://cors-anywhere.herokuapp.com/`;
    let musixMatch = `http://api.musixmatch.com/ws/1.1/`;

    const currSong = req.body.currSong;
    const musixmatch_key = process.env.musixmatchKey || dev_config.musixmatchKey;

    axios
        .get(`${musixMatch}matcher.lyrics.get?apikey=${musixmatch_key}&q_track=${(currSong.songName)}&q_artist=${(currSong.artistName)}`)
        .then(response => {
            if (response?.data) {
                res.send(response.data);
            }
        })
        .catch(error => {
            console.error(error);

            res.status(404).send();

        })

});

app.post('/line-trans', (req, res, next) => {
    if (req.body?.line) {

        try {
            let azureApi = `https://api.cognitive.microsofttranslator.com`;

            const line = req.body.line;
            const azure_translate_api = process.env.azureTranslateApi || dev_config.azureTranslateApi;

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
                data: [{
                    'text': decodeURI(line)
                }],
                responseType: 'json'
            }).then(function (response) {
                if (response.data[0].translations[0]) {
                    res.send({ trans: response.data[0].translations[0].text });
                } else {
                    res.send('translation faild for: ' + req.body.line)
                }
            }).catch((err) => {
                res.send('translation faild for: ' + req.body.line)
                console.error(err);
            });
        } catch {
            try{
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
            }catch{
                res.status(404).send();
            }
          
        }
    }

});

app.post('/single-trans', (req, res, next) => {
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
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log('listen 5000...') })