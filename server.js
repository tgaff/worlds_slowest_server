// require express and other modules
var express = require('express'),
    app = express();
var Throttle = require('throttle')
var fs = require("fs");
var mime = require('mime');
var path = require('path');
var bodyParser = require("body-parser"),

THROTTLE_SPEED = 20000; // bps
RESPONSE_DELAY = 3000; // ms

// decode req body
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files (fast) from public folder
app.use('/fastpublic', express.static(__dirname + '/public'));

// transfers files slowly based on THROTTLE_SPEED with delay RESPONSE_DELAY
function transferFileSlowly(assetPath, req, res, next) {
  var fileName = assetPath;

  setTimeout(function() {
    try {
        // verify file presence (throws on failure)
        fs.accessSync(fileName, fs.F_OK);
        var filestream = fs.createReadStream(fileName);
        var throttle = new Throttle(THROTTLE_SPEED)
        console.log("transferring " + fileName + " at " + THROTTLE_SPEED + "bps")

        res.setHeader("Content-Type", mime.lookup(fileName))
        filestream.pipe(throttle).pipe(res);
    } catch (e) {
        // why don't we have proper error classes in node?
        if (e.message.slice(0,6) === 'ENOENT') {
          console.log("404 on file: ", fileName);
          res.sendStatus(404);
        } else {
          console.log("unknown error", e);
          res.sendStatus(400)
        }
    }



  }, RESPONSE_DELAY)
}



/************
 * DATABASE *
 ************/

// your hardcoded data here

/**********
 * ROUTES *
 **********/

/*
 * HTML Endpoints
 */

app.get('/', function homepage (req, res) {
  var file = __dirname + '/views/index.html';
  transferFileSlowly(file, req,res);

//  res.sendFile(__dirname + '/views/index.html');
});

app.get('/config*', function(req, res, next) {
  res.sendFile(path.join(__dirname + '/views/config.html'));
})

app.get('/css/:fileName', function(req,res,next) {
  var file = __dirname + '/public/css/' + req.params.fileName
  transferFileSlowly(file, req,res,next);
});


app.get('/js/:fileName', function(req,res,next) {
  var file = __dirname + '/public/js/' + req.params.fileName
  transferFileSlowly(file, req,res,next);
})

/*
 * JSON API Endpoints
 */

app.get('/api', function api_index (req, res){
  res.json({
    message: "config api",
    endpoints: [
      {method: "GET", path: "/api/", description: "Describes available endpoints"},
      {method: "GET", path: "/api/config", description: "Get current server config"},
      {method: "PUT", path: "/api/config", description: "Set server config"}
    ]
  })
});
app.get('/api/config', readServerConfig);

app.post('/api/config', function (req, res){
  console.log(req.body);
  if (req.body.responseDelay) {
    RESPONSE_DELAY = parseInt(req.body.responseDelay);
  }
  if (req.body.transmitSpeed) {
    THROTTLE_SPEED = parseInt(req.body.transmitSpeed);
  }
  readServerConfig(req,res);
});

function readServerConfig(req, res){
  res.json({
    transmitSpeed: THROTTLE_SPEED,
    responseDelay: RESPONSE_DELAY
  })
}

/**********
 * SERVER *
 **********/

// listen

listenPort = process.env.port || 5000;
app.listen(listenPort, function () {
  console.log('Express server is running on http://localhost:' + listenPort + '/');
});
