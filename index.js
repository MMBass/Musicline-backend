const express = require('express')
const app = express()
const cors = require('cors')

const axios = require('axios');

const Reverso = require('reverso-api');
const reverso = new Reverso();

const dev_config = (process.env.store === undefined) ? require('./devConfig') : undefined;

app.use(cors());
app.use(express.json());

function init() {

}

app.get('/', (req, res) => {
    res.status(200).send();
});

app.post('/lyrics', (req, res, next) => {
    let cors = `https://cors-anywhere.herokuapp.com/`;
    let musixMatch = `http://api.musixmatch.com/ws/1.1/`;

    const currSong = req.body.currSong;
    const musixmach_key = process.env.musixmachKey || dev_config.musixmachKey;

    axios
        .get(`${musixMatch}matcher.lyrics.get?apikey=${musixmach_key}&q_track=${encodeURI(currSong.songtName)}&q_artist=${encodeURI(currSong.artistName)}`)
        .then(response => {
            console.log(response.data);
            if(response?.data){
                res.send(response.data);
            }
        })
        .catch(error => {
            console.error(error)
            res.status(404).send();
        
        })

});

app.post('/line-trans', (req, res, next) => {
    console.log(decodeURI(req.body.line));
    if (req.body?.line) {
        reverso.getTranslation(decodeURI(req.body.line), 'English', 'Hebrew', (response) => {
            console.log(response.translation[0]);
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

});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log('listen 5000...') })