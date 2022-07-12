var express = require('express');
var router = express.Router();

const transController  = require('../controllers/translation.controller');

router.post('/single', transController.singleTrans);
router.post('/single-line', transController.singleLineTrans);
router.post('/lines', transController.lineTrans);

module.exports = router;