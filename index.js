"use strict"

//npm modules
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var morgan = require('morgan');
var port = process.env.PORT || 8000;
var mysql = require("mysql");
var expressJWT = require("express-jwt");
var jwt = require('jsonwebtoken');

//Router requires
var authRoute = require('./api/routes/route');
var dbconfig = require('./config/dbconfig');
var connection = mysql.createConnection(dbconfig.connection);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(expressJWT({secret: 'Partha Sarathi Nanda'}).unless({path: ['/login', 'signup']}));

app.post('/login', (req, res)=>{

    let email = req.body.email;
    let password = req.body.password;
    if(!email){
        res.status(400).json('email required');
    }
    if(!password){
        res.status(400).json("password required");
    }

    var stmt = "SELECT * from user where email = ? ";
    connection.query(stmt, [email], (error, results)=>{
        if(error){
            throw error;
        }
        if(!results.length){
            res.status(401).json("No user registered with this email");
        }
        else if(password !== results[0].password){
            res.status(400).json("Invalid password");
        }
        else{
            let token = jwt.sign({username: req.body.email,id: results[0].id},'Partha Sarathi Nanda')
            res.status(200).json(token);
        }
    })

})

app.post('/signup',(req, res)=>{
    var stmt = "SELECT * from user where email = ? ";
     connection.query(stmt, [email], (error, results)=>{
        if(error){
            throw error;
        }
        if(results.length){
            res.json("User already exists");
        }
        else{
            var email = req.body.email;
            var password = req.body.password;
            var username = req.body.password;
            var insertQuery = "INSERT INTO user ( username,password,email) values (?,?,?)";
            connection.query(insertQuery,[username, password, email], (error, result)=>{
                res.status(200).json("Successfully registered");
            })
        }
     })
})

function isAuthenticated(req, res, next){
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token, 'Partha Sarathi Nanda', (error, decode)=>{
            if(error){
                res.json("failed to authenticate");
            }
            else{
                req.decoded = decoded;
                return next();
            }
        })
    }
    else{
        res.status(403).send('token not provided');
    }
}

app.listen(port, ()=>{
    console.log("local host is running");
})

