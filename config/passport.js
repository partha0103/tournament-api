const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mysql = require('mysql');
const dbconfig = require('./dbconfig');
const bodyParser   = require('body-parser');

let jwtOpts = {};
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOpts.secretOrKey = 'Partha';


module.exports = (passport) =>{
    passport.use(new JwtStrategy(jwtOpts,function))
}
