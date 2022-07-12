const dev_config = (process.env.vercel === undefined) ? require('../devConfig') : undefined;
const axios = require('axios');
const genius = require('genius-lyrics-api');

const getLyrics = async (req, res) => {
        const en_pattern = /^[~`!@#$%^&*()_=[\]\{}|;':",.\/<>?a-zA-Z0-9- \s\S]+$/; // accepts linebreaks, no plus sign;
        const currSong = req.body.currSong;
    
        if (!en_pattern.test(decodeURI(currSong))) res.status(400).send({ message: 'english only' });
    
        const genious_key = process.env.geniousApi || dev_config.geniousApi;
        // https://genius.com/api-clients // manage apps
    
        try {
            const options = {
                apiKey: genious_key,
                title: decodeURI(currSong.songName),
                artist: decodeURI(currSong.artistName),
                optimizeQuery: true
            };
    
            genius.getLyrics(options).then((lyrics) => {
                if (lyrics?.length < 4500 && (en_pattern.test(lyrics))) {
                    res.send({ lyrics });
                } else {
                    if (!lyrics) {
                        res.status(404).send({ message: 'song not found' });
                    } else if (lyrics?.length > 4500) {
                        res.status(500).send({ message: 'song too long' });
                    } else if ((!en_pattern.test(lyrics))) {
                        res.status(500).send({ message: 'song has to be fully english' });
                    }
                }
            })
        } catch {
            console.log('catch');
            let musixMatch = `http://api.musixmatch.com/ws/1.1/`;
    
            const musixmatch_key = process.env.musixmatchKey || dev_config.musixmatchKey;
            // https://developer.musixmatch.com/admin // no option to change - todo important if start paying replace the token
    
            axios
                .get(`${musixMatch}matcher.lyrics.get?apikey=${musixmatch_key}&q_track=${(currSong.songName)}&q_artist=${(currSong.artistName)}`)
                .then(response => {
                    console.log(response);
                    if (response?.data) {
                        res.send({ lyrics: response.data.message.body.lyrics.lyrics_body });
                    }
                })
                .catch(error => {
                    console.error(error);
                    res.status(404).send();
    
                })
        }
}

module.exports = { getLyrics };