var mysql = require('mysql');
var Match = require('./matches').Match;
function get_connection() {
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'mountblue',
      database : 'tournament'
    });
    connection.connect();
    return connection
}

function getTournaments(user_id,cb){
    var stmt = "select * from tournament where user_id= ?";
    var connection = get_connection();
    connection.query(stmt,user_id,function(error, results){
        connection.end();
        if(error){
            res.send("Unable to fetch the result");
        }
        cb(results);
    });
}


function registerPlayer(user_id, tournament_id, name, cb){
    var connection = get_connection();
    var stmt = "select count(distinct name) as count from player where user_id = ? and name = ?"
    connection.query(stmt, [user_id, name], function(error, result){
        if(error){
            var response = {
                'message': 'Unable to register',
                'flag': false
            }
            cb(response);
        }
        else if(result[0].count > 0){
            var response = {
                'message': 'already exists',
                'flag': false
            }
            cb(response);
        }
        else{
            var stmt = "insert into player(user_id, tournament_id, name) values(?,?,?)";
            var connection = get_connection();
            connection.query(stmt,[user_id, tournament_id, name],function(error, results){
                connection.end();
                if(error){
                    var response = {
                        'message': 'Unable to insert',
                        'flag': false
                    }
                    cb(response);
                }
                var response = {
                    'id': results.insertId,
                    'name': name
                }
                cb(response);
            });
        }
    })
}

function registerExisting(user_id, tournament_id, name, cb){
    var stmt = "insert into player(user_id, tournament_id, name) values(?,?,?)";
    var connection = get_connection();
    connection.query(stmt,[user_id, tournament_id, name],function(error, results){
        connection.end();
        if(error){
            cb("Unable to insert");
        }
        cb("Successfully inserted");
    });
}

function playersInTour(tournament_id, cb){
    var stmt = "select * from player where tournament_id= ?";
    var connection = get_connection();
    connection.query(stmt,tournament_id,function(error, results){
        connection.end();
        if(error){
            cb("Unable to get players inthe tournament");
        }
        cb(results);
    });
}

function playerDetails(user_id,tournament_id, cb){
    playerInTour(tournament_id, function(t_players){
        var connection = get_connection();
        var stmt = "select name from player where user_id = ?"
        connection.query(stmt, user_id,function(error, u_players){
            if(error)
                res.json("unable to find player details");
            else{
                var result= {
                    t_players: t_players,
                    u_players: u_players
                }
                res.json(result);
            }
        })
    })
}

function countPlayers(tournament_id,cb){
    var connection = get_connection();
    var stmt = "select count(*) as no_player from player where tournament_id=?";
    connection.query(stmt,tournament_id,function(error,result) {
        connection.end();
        if(error){
            cb("Unable to fetch the data");
        }
        var count = result[0].no_player;
        cb(count);
    });
}
function isPowOf2(n){
    return (Math.log2(n)) % 1 == 0;
}
function startTournament(tournament_id,cb){
    countPlayers(tournament_id,function(count){
        if(isPowOf2(count)){
            cb(true);
        }
        else
            cb(false);
    })
}

function deleteMatches(tournament_id,cb){
    var connection = get_connection();
    var stmt = "delete from matches where tournament_id = ?;";
    connection.query(stmt,tournament_id,function(error,result) {
        connection.end();
        if(error){
            cb("Unable todelete matches");
        }
        cb('All the details from the match deleted');
    });
}

function deletePlayer(id,cb){
    var connection = get_connection();
    var stmt = "delete from player where id = ?";
    connection.query(stmt,id,function(error,result) {
        connection.end();
        if(error){
            cb("Unable to deleteplayer");
        }
        cb('deleted');
    });
}

function currentStandings(tournament_id,cb){
    var connection = get_connection();
    var stmt = `select p.id, p.name, m.matches as ma, w.wins as wins from player as p join matchs_count as m on p.id = m.player_id join win_count as w on   p.id = w.player_id where p.tournament_id = ? order by wins desc;`
    connection.query(stmt,tournament_id,function(error,results) {
        connection.end();
        if(error){
            cb("Unable to get the standings");
        }
        var standings = [];
        results.forEach(function(result,index){
            standings.push({
                id: result.id,
                name: result.name,
                no_matches: result.ma,
                wins: result.wins,
                losses: (result.ma- result.wins)
            });
        });
        cb(standings);
    });
}

function swissPairings(tournament_id,cb){
    buildMatches(tournament_id,function(matches){
        currentStandings(tournament_id,function(standings){
            var pairings = [];
            while(standings.length > 0){
                var p1_name = standings[0].name;
                var round = standings[0].no_matches;
                var player1 = standings.splice(0,1)[0].id;
                for(let i = 0; i < standings.length ; i++){
                    var player2 = standings[i].id;
                    var p2_name = standings[i].name;
                    var match1 = {
                        player1: player1,
                        player2: player2
                    };
                    var match2 = {
                        player1: player2,
                        player2: player1
                    };
                    if(matches.hasPlayed(match1) || matches.hasPlayed(match2)){

                    }
                    else{
                        var pair = {
                            player1: player1,
                            p1_name: p1_name,
                            player2: player2,
                            p2_name: p2_name,
                            round: round
                        };
                        pairings.push(pair);
                        standings.splice(0,1);
                        break;
                    }
                }
            }
            cb(pairings);
        });
    });
}

function isStarted(tournament_id, cb){
    var stmt = "select tournament_id from matches where tournament_id= ?";
    var connection = get_connection();
    connection.query(stmt, tournament_id,function(error, result){
        connection.end();
        if(error){
            cb(false);
        }
        if(result.length == 0){
            cb(false);
        }
        else{
            cb(true);
        }
    })
}

function isFinished(tournament_id, cb){
    countPlayers(tournament_id, function(count){
        var max_round = Math.log2(count);
        var stmt = "select * from win_count where tournament_id = ? LIMIT 1";
        console.log(max_round);
        var connection = get_connection();
        connection.query(stmt,tournament_id,function(error, results){
            if(error){
                cb(false);
            }
            else{
                if((results[0].wins) == max_round){
                    var connection = get_connection();
                    var winner = results[0].player_id;
                    console.log("winner", winner);
                    var stmt = "select name from player where id = ?";
                    connection.query(stmt, winner, function(error, result){
                        if(error)
                            cb(false);
                        else{
                            var connection = get_connection();
                            var winner_name = result[0].name;
                            var stmt = "update tournament set winner = ? where id = ?";
                            connection.query(stmt, [winner_name, tournament_id], function(error, result){
                                if(error)
                                    cb(false);
                                else
                                    cb(true);
                            });
                        }
                    })
                }
                else{
                    cb(false);
                }
            }
        });
    })
}

function playTournament(tournament_id, cb){
    swissPairings(tournament_id, function(matches){
        countPlayers(tournament_id, function(count){
            var max_round = Math.log2(count);
            var round = matches[0].round+ 1;
            if(round == max_round){
                cb(false);
            }
            else{
                var w_list = [];
                matches.forEach(function(match, index, matches){
                    console.log("Hello");
                    player1 = match.player1;
                    player2 = match.player2;
                    var winner = player1;
                    var w_name = "";
                    if(Math.random() > 0.49){
                        winner = player1;
                        w_name = match.p1_name;
                    }
                    else{
                        winner = player2;
                        w_name = match.p2_name;
                    }
                    var c_match = {
                        p1_name: match.p1_name,
                        p2_name: match.p2_name,
                        w_name: w_name
                    }
                    w_list.push(c_match);
                    var stmt = "insert into matches(tournament_id, player1_id, player2_id, winner_id) values(?,?,?,?)"
                    var connection = get_connection();
                    connection.query(stmt, [tournament_id,player1, player2, winner], function(error, result){
                        connection.end();
                        if(error)
                            throw (false);
                        else if(index == matches.length-1){
                            cb(w_list);
                        }
                    });
                })
            }
        })

    })

}


function matchesPlayed(id,cb){
    var connection = get_connection();
    var stmt = `select (select name from player where id = t.player1_id) as player1_name,
                (select name from player where id = t.player2_id) as player2_name,
                (select name from player where id = t.winner_id) as winner_name,
                round
                from matches t where t.tournament_id = ?`
    connection.query(stmt,id,function(error,results) {
        connection.end();
        if(error){
            cb("Unable to get the details");
        }
        else{
            let matches = [];
            for(let i=0; i<results.length; i++){
                let losser = (results[i].winner_name == results[i].player1_name ? results[i].player2_name : results[i].player1_name);
                let match = {
                    player1_name : results[i].player1_name,
                    player2_name : results[i].player2_name,
                    winner_name : results[i].winner_name,
                    losser_name: losser,
                    round: results[i].round
                }
                matches.push(match);
            }
            cb(matches);
        }
    });
}

function buildMatches(tournament_id,cb){
    var connection = get_connection();
    var stmt = "select * from  matches where tournament_id = ?";
    connection.query(stmt,tournament_id,function(error,results) {
        connection.end();
        if(error){
            cb("Unable to build matches");
        }
        var matches = new Match();
        for(var row of results){
            var match = {
                player1: row.player1_id,
                player2: row.player2_id
            }
            matches.addMatch(match);
        }
        cb(matches);
    });
}

function create_tournament(user_id,name,cb){
    var connection = get_connection();
    var stmt = 'Insert into tournament(user_id, name) values(?, ?)';
    connection.query(stmt,[user_id,name],function(error, results){
        connection.end();
        if(error){
            cb("unable to create");
        }
        cb(results);
    });
}


function play(tournament_id,round,winner, status,cb){
    swissPairings(tournament_id, function(matches){
        countPlayers(tournament_id, function(count){
            var max_round = Math.log2(count);
            console.log(matches);
            var round = matches[0].round;
            if(round == max_round){
                cb(false);
            }
            else{
                var w_list = [];
                matches.forEach(function(match, index, matches){
                    player1 = match.player1;
                    player2 = match.player2;
                    var m_winner = winner[index];
                    var c_match = {
                        p1_name: match.p1_name,
                        p2_name: match.p2_name,
                        winner: m_winner
                    }
                    var winner_id = "";
                    if(match.p1_name == m_winner){
                        winner_id = player1;
                    }
                    else{
                        winner_id = player2;
                    }
                    w_list.push(c_match);
                    var stmt = "insert into matches(tournament_id, player1_id, player2_id, winner_id,round, r_status) values(?,?,?,?,?,?)"
                    var connection = get_connection();
                    connection.query(stmt, [tournament_id,player1, player2, winner_id, round, status], function(error, result){
                        connection.end();
                        if(error)
                            cb(false);
                        else if(index == matches.length-1){
                            cb(w_list);
                        }
                    });
                })
            }
        })

    })

}

function roundstatus(tournament_id, cb){
    countPlayers(tournament_id, function(count){
        var stmt = "select * from matches where tournament_id = ? group by round";
        var connection = get_connection();
        connection.query(stmt,[tournament_id],function(error, results){
            connection.end();
            if(error){
                cb("Unable to get the round status");
            }
            var obj = {
                count: count,
                status: results
            }
            cb(obj);
        });
    })
}


function updateTstatus(tournament_id,cb){
    isStarted(tournament_id,function(flag){
        console.log(flag,"Hello");
        if(flag){
            isFinished(tournament_id, function(fw){
                var status = "";
                if(fw){
                    status  = "Finished";
                }
                else{
                    status = "On progress";
                }
                var stmt = "update tournament  set status = ?  where  id = ?";
                var connection = get_connection();
                connection.query(stmt,[status,tournament_id],function(error, results){
                    connection.end();
                    if(error){
                        cb("Unable to update");
                    }
                    cb(results);
                });
            })
        }
    })
}

function getroundResult(tournament_id,round, cb){
    var stmt = `select (select name from player where id = t.player1_id) as player1_name,
                (select name from player where id = t.player2_id) as player2_name,
                (select name from player where id = t.winner_id) as winner_name
                from matches t where t.tournament_id = ? and
                round = ?`
    var connection = get_connection();
    console.log("round", "yudgdld");
    connection.query(stmt,[tournament_id, round],function(error, results){
        connection.end();
        if(error){
            cb("Unable to getRound");
        }
        console.log(results, "jnjndk");
        cb(results);
    });
}

function getTstatus(tournament_id, cb){
    var stmt = "select * from tournament where id = ?";
    var connection = get_connection();
    connection.query(stmt,tournament_id,function(error, results){
        connection.end();
        if(error){
            cb("Unable to get tstatus");
        }
        else if(results[0].status === "Yet to start"){
            cb(false);
        }
        else{
            cb(true);
        }
    });
}
function winner(tournament_id, cb){
    var stmt = "select winner from tournament where id = ?";
    var connection = get_connection();
    connection.query(stmt,tournament_id,function(error, results){
        connection.end();
        if(error){
            cb("Unable to declare winner");
        }
        else if(results[0].winner == "Tournament yet to be finished")
            cb("Tournament yet to be finished");
        else{
            cb(results[0].winner);
        }
    });
}

function addExistingPlayers(user_id, tournament_id, cb){
    var stmt = `select distinct name from player where user_id=? and tournament_id not in (?) and
                             name not in(select name from player where tournament_id=?)`
    var connection = get_connection();
    connection.query(stmt,[user_id,tournament_id, tournament_id],function(error, results){
        connection.end();
        if(error){
            cb("Unable to add");
        }
        cb(results);
    });
}

function updateTournament(u_id,t_name, t_status, t_id, add_players, remove_players, cb){
    getTstatus(t_id, function(status){
        if(status){
            let stmt = "update tournament  set status = ?  where  id = ?";
            let connection = get_connection();
            connection.query(stmt, [t_status, t_id], (error, result) => {
                if(error){
                    throw error
                }
                else{
                    cb({
                        success: true,
                        status: t_status
                    })
                }
            })
        }
        else{
            getAllPlayers(u_id, function(existing_player){
                existing_player = playersArray(existing_player);
                if(add_players.length > 0){
                    let add_player = playersArray(add_players);
                    areValidPlayers(existing_player, add_player, function(flag){
                        if(flag){
                            add_players.forEach( (player) => {
                                console.log(player);
                                registerPlayer(u_id, t_id, player.name);
                            })
                        }
                        else{
                            cb("Added players are not valid users");
                        }
                    })
                }
                else if(remove_players.length > 0){
                    let remove_player = playersArray(remove_players);
                    areValidPlayers(existing_player, remove_player, function(flag){
                        if(flag){
                            remove_player.forEach( (player)=>{
                                deletePlayer(player, (message) => {
                                    console.log(message);
                                })
                            } );
                            cb({
                                success: true,
                                status: t_status
                            });
                        }
                        else{
                            cb("Added players are not valid users");
                        }
                    })
                }
            })
        }
    })
}

function getAllPlayers(u_id, cb){
    let connection = get_connection();
    let stmt = "select id, name from player where user_id = ?";
    connection.query(stmt, u_id, function(error, result){
        if(error){
            throw error;
        }
        else{
            let players = [];
            for(let i=0;i<result.length; i++){
                let player = {
                    id: result[i].id,
                    name: result[i].name
                }
                players.push(player);
            }
            cb(players);
        }
    })
}

//Get all players registered for a particular tournament
function getPlayersInTournament(id, cb){
    let connection = get_connection();
    let stmt = "select id, name from player where tournament_id = ?";
    connection.query(stmt, id, function(error, result){
        if(error){
            throw error;
        }
        else{
            let players = [];
            for(let i=0;i<result.length; i++){
                let player = {
                    id: result[i].id,
                    name: result[i].name
                }
                players.push(player);
            }
            cb(players);
        }
    })
}

function areValidPlayers(existing_player, players_added, cb){
    existing_player.sort();
    players_added.sort();
    let flag = true;;
    for(let i=0; i<players_added.length; i++){
        if(existing_player.indexOf(players_added[i]) == -1){
            flag = false;
            break;
        }
    }
    cb(flag);
}


function getCurrentRound(id, cb) {
    let stmt = " Select round from matches where tournament_id = ? order by round desc LIMIT 1";
    var connection = get_connection();
    connection.query(stmt, id, (error, result) =>{
        if(error){
            throw error;
        }
        else{
            let round = result[0].round;
            cb(round);
        }
    })
}

function getTournamentDetails(id, details,cb){
    getPlayersInTournament(id, (players) => {
        getCurrentRound(id, (round) => {
            tournamentDetails(id, (tour_details) => {
                let response = {
                    success: true,
                    tour_name: tour_details.name,
                    status: tour_details.status,
                    winner: tour_details.winner,
                    round: round,
                    players: players
                }
                if(details === 'true'){
                    matchesPlayed(id, (matches) => {
                        response.matches = matches;
                        cb(response);
                    })
                }
                else{
                    cb(response);
                }
            })
        })
    })
}

function tournamentDetails(id, cb){
    let stmt = "Select * from tournament where id = ?";
    let connection = get_connection();
    connection.query(stmt, id, (error, result) => {
        if(error){
            throw error;
        }
        else{
            let detail = {
                name: result[0].name,
                id: id,
                status: result[0].status,
                winner: result[0].winner
            }
            cb(detail);
        }
    })
}

function playersArray(players){
    let result = [];
    players.forEach( (player) => {
        result.push(player.id);
    });
    return result;
}

module.exports = {
    getTournaments: getTournaments,
    playersInTour: playersInTour,
    playerDetails: playerDetails,
    registerPlayer: registerPlayer,
    countPlayers: countPlayers,
    startTournament: startTournament,
    currentStandings: currentStandings,
    swissPairings: swissPairings,
    isStarted: isStarted,
    playTournament: playTournament,
    matchesPlayed: matchesPlayed,
    create_tournament: create_tournament,
    tournamentStatus: getTstatus,
    play: play,
    updateTstatus: updateTstatus,
    roundstatus: roundstatus,
    getroundResult: getroundResult,
    winner: winner,
    get_connection: get_connection,
    addExistingPlayers:addExistingPlayers,
    registerExisting: registerExisting,
    updateTournament: updateTournament,
    getAllPlayers: getAllPlayers,
    getTournamentDetails: getTournamentDetails
}
