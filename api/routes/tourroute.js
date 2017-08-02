var express = require('express');
var router = express.Router();
const tournament = require('./../controller/tournament');

router.route('/')
    .post(tournament.createTournament)
    .put(tournament.updateTournament)

router.route('/all/:id')
      .get(tournament.getTournament)

router.route('/list')
      .get(tournament.getTournamentList)

module.exports = router;
