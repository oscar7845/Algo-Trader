var express = require('express');
var http = require('http');
var WebSocket = require('ws')


//import modules
var myapp = require('./main/async');


var router = express();
var server = http.createServer(router);
const ws = new WebSocket.Server({ server });

router.use(requireHTTPS);
router.use(express.static(__dirname + "/public"));
router.use(express.bodyParser());


function requireHTTPS(req, res, next) {
  if (req.headers.host != 'localhost:3000') {
    if (req.headers["x-forwarded-proto"] === "https") {
      // OK, continue
      return next();
    };
    res.redirect('https://' + req.headers.host + req.url);
  }
  else {
    return next();
  }
}

//client websocket
ws.on('connection', function connection(ws) {
  console.log('client connected')

  ws.on('error', function error(err) {
    console.log('Error: ' + err.code);
  });

  myapp.openClientSocket(ws)
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
  console.log("Server listening");
  myapp.start();
  //myapp.openClientSocket(ws)
});

router.use(function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

process.on('uncaughtException', function (err) {
  //console.log(err);
}); 





