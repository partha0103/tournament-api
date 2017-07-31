const tournament = require('./../../lib/tournament.js');

exports.createTournament = (req, res)=>{
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

