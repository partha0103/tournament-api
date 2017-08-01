var express = require('express');
var router = express.Router();
const tournament = require('./../controller/tournament');

router.route('/')
    .post(tournament.createTournament)
    .put(tournament.updateTournament)

router.route('/:id')
      .get(tournament.getTournament)

module.exports = router;
