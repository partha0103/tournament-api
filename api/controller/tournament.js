const tournament = require('./../../lib/tournament.js');

exports.createTournament = (req, res) => {
    let user_id = req.user.id;
    let name = req.body.name;

    if(name.length > 0 && name.length<=50){
        tournament.create_tournament(user_id,name, function(result){
            res.json({
                "success": true,
                "message": "Successfully created Tournament"
            });
        })
    }
    else{
        res.json({
            "success": false,
            "message": "Tournament name should be between 1 to 50 charecters"
        })
    }
}

exports.getTournamentList = (req, res) => {
    let user_id = req.user.id;
    tournament.getTournaments(user_id, (tournaments) => {
        res.status(200).json({
            "success": true,
            "tournaments": tournaments
        })
    })
}
exports.registerPlayer = (req, res) => {
    let user_id = req.user.id;
    let tournament_id = req.body.tour_id;
    let name = req.body.name;
    tournament.registerPlayer(user_id, tournament_id, name, function(result){
        res.status(200).json(result);
    })
}

exports.getAllPlayers = (req, res) => {
    let user_id = req.user.id;
    tournament.getAllPlayers(user_id, (players) =>{
        res.status(200).json(players);
    })
}

exports.updateTournament = (req, res) => {
    let user_id = req.user.id;
    let tour_name = req.body.tour_name;
    let tour_status = req.body.tour_status;
    let tour_id = req.body.tour_id;
    let add_players = [];
    let remove_players = [];
    if(req.body.add_players){
        add_players = req.body.add_players;
    }

    if(req.body.remove_players){
        remove_players = req.body.remove_players;
    }

    if(tour_name === ""){
        res.status(400).json({
            "success": false,
            "message": "Tournament name can't be empty"
        });
    }
    else if(tour_status === ""){
        res.status(400).json({
            "success": false,
            "message": "Tournament status can't be empty"
        });
    }

    else if(tour_id < 0 || tour_id === undefined){
        res.status(400).json({
            "success": false,
            "message": "Tournament id can't be undefined"
        });
    }
    else{
        tournament.updateTournament(user_id, tour_name, tour_status, tour_id, add_players, remove_players, (result) => {
            res.status(200).json(result);
        })
    }
}

exports.getTournament = (req, res) => {
    let id = req.params.id;
    let details = req.query.details;
    tournament.getTournamentDetails(id, details,(response) => {
        res.status(200).json(response);
    })
}
