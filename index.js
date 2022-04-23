const express = require('express')
const app = express()
const cors = require('cors')

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const Reverso = require('reverso-api');
const reverso = new Reverso();

let genius =  require ('genius-lyrics-api');
const urlencoded = require('body-parser/lib/types/urlencoded');

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
    const currSong = req.body.currSong;

    try{
        const options = {
            apiKey: 'vaqpKvuPqPuhDIaf9uNkKjycJ4OKyzwJXu1Ph2uLkogU8l_FKXuKeFpX3UcGu90F',
            title: decodeURI(currSong.songName),
            artist: decodeURI(currSong.artistName),
            optimizeQuery: true
        };
    
        genius.getLyrics(options).then((lyrics) =>{
            res.send({lyrics});
        })
    }catch{
        let musixMatch = `http://api.musixmatch.com/ws/1.1/`;

        const musixmatch_key = process.env.musixmatchKey || dev_config.musixmatchKey;
    
        axios
            .get(`${musixMatch}matcher.lyrics.get?apikey=${musixmatch_key}&q_track=${(currSong.songName)}&q_artist=${(currSong.artistName)}`)
            .then(response => {
                if (response?.data) {
                    res.send({lyrics: response.data.message.body.lyrics.lyrics_body});
                }
            })
            .catch(error => {
                console.error(error);
    
                res.status(404).send();
    
            })
    }

});

app.post('/line-trans', (req, res, next) => {
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
                    res.send('translation faild for: ' + req.body.lines)
                }
            }).catch((err) => {
                res.send('translation faild for: ' + req.body.lines)
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