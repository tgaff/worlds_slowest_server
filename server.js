// require express and other modules
var express = require('express'),
    app = express();
var Throttle = require('throttle')
var fs = require("fs");
var mime = require('mime');
THROTTLE_SPEED = 20000; // bps
RESPONSE_DELAY = 3000; // ms


// serve static files from public folder
//app.use(express.static(__dirname + '/public'));

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
    message: "Welcome to my personal api!",
    documentation_url: "https://github.com/sf-wdi-25/express_self_api/README.md", // CHANGE THIS TO LINK TO YOUR README.md
    base_url: "http://YOUR-APP-NAME.herokuapp.com",
    endpoints: [
      {method: "GET", path: "/api", description: "Describes available endpoints"}
    ]
  })
});

/**********
 * SERVER *
 **********/

// listen

listenPort = process.env.port || 5000;
app.listen(listenPort, function () {
  console.log('Express server is running on http://localhost:' + listenPort + '/');
});
