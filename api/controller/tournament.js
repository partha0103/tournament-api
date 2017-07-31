const tournament = require('./../../lib/tournament.js');

exports.createTournament = (req, res) => {
    let user_id = req.user.id;
    let name = req.body.name;

    if(name.length > 0 && name.length<=50){
        tournament.create_tournament(user_id,name, function(result){
            res.json({
                "message": "Successfully created Tournament"
            });
        })
    }
    else{
        res.json({
            "message": "Tournament name should be between 1 to 50 charecters"
        })
    }
}

exports.registerPlayer = (req, res) => {
    let user_id = req.user.id;
    let tournament_id = req.body.tour_id;
    let name = req.body.name;
    tournament.registerPlayer(user_id, tournament_id, name, function(result){
        res.status(200).json(result);
    })
}