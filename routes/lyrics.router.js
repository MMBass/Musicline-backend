var express = require('express');
var router = express.Router();

const lyricsController  = require('../controllers/lyrics.controller.js');

router.post('/', lyricsController.getLyrics);

module.exports = router;