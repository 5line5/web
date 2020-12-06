var http = require('http');
var fs = require('fs');
var url = require('url');
const { callbackify } = require('util');
const MongoClient = require("mongodb").MongoClient;
   
const urlMongodb = "mongodb://localhost:27017/usersdb";
const mongoClient = new MongoClient(urlMongodb, { useUnifiedTopology: true, useNewUrlParser: true });
   
let dbClient;
var server = new http.Server();

mongoClient.connect(function(err, client) {
    if(err) return console.log(err);
    dbClient = client;
    server.collection = client.db("usersdb").collection("users");
    server.listen(4200, '127.0.0.1');
});

server.on('request', function(req, res){
    var urlParsed = url.parse(req.url, true);
    console.log(urlParsed);
    console.log(req.headers);
    if (urlParsed.pathname == '/img') {
        fs.readFile("image.jpg", function(err, data) {
            if (err) {
                console.error(err.message);
            } else {
                res.end(data);
            }
        });
    } else if (urlParsed.pathname == '/otherimg') {
        fs.readFile("other.jpg", function (err, data){
            if (err) {
                console.error(err.message);
            } else {
                res.end(data);
            }
        });
    } else if (urlParsed.pathname === '/content') {
        fs.readFile("content.txt", {encoding: 'utf-8'}, function(err, data) {
            if (err) {
                console.error(err.message);
            } else {
                res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Headers","Origin,Content-Type, X-Auth-Token, Authorization");
                res.end(data);
            }
        });
    } else {
        const collection = server.collection;
        collection.find({serverid: parseInt(urlParsed.pathname.substring(10), 10)}).toArray(function(err, results){
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers","Origin,Content-Type, X-Auth-Token, Authorization");
            let result = 'Пользователи: ';
            for (const r of results){
                result += 'Имя ' + r.name + ' Возраст ' + r.age + ' Id ' + r.serverid + ', ';
            }
            console.log(result)
            res.end(urlParsed.query.callback + '("' + result.substring(0, result.length-2) + '")');
        });
    };
});

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});