var express = require('express');
var router = express.Router();
const tournament = require('./../controller/tournament');

router.route('/')
    .post(tournament.registerPlayer)

module.exports = router;