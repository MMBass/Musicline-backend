const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet');

const indexRouter = require('./routes/index.router.js');
const lyricsRouter = require('./routes/lyrics.router.js');
const transRouter = require('./routes/translation.router.js');

app.use(helmet());
app.use(cors());
app.use(express.json());

function init() {

}
init();

app.use('/', indexRouter);
app.use('/lyrics', lyricsRouter);
app.use('/trans', transRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).send({ message: err.message });
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log('listen 5000...') });