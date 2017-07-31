var express = require('express');
var router = express.Router();
const tournament = require('./../controller/tournament');

router.route('/')
    .get(tournament.getAllPlayers)
    .post(tournament.registerPlayer)

module.exports = router;
