const config = require("./config.json");
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
var favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/images/favicon.ico'));

//connect to MongoDB
mongoose.connect(config.mongourl, { useNewUrlParser: true });
var db = mongoose.connection;
mongoose.set('useCreateIndex', true);
//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB with no errors.');
});

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
// serve static files from template
app.use(express.static(__dirname + '/public'));

// include routes
var routes = require('./routes/');

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


// listen on port {port} <- config
app.listen(config.port, function () {
  console.log('Express server started. Listing on port '+ config.port+'.');
});
