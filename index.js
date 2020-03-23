const config = require("./env/config.json");
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let favicon = require('serve-favicon');
let platform = require("./env/platform.json");
let User = require('./models/user');


app.use(favicon(__dirname + '/public/images/favicon.ico'));

//connect to MongoDB
mongoose.connect(config.mongourl, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
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
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));

app.set('view engine', 'ejs');
// serve static files from template
app.use(express.static(__dirname + '/public'));

// include routes
let routes = require('./routes/');

app.locals.platform = platform;

app.use(async (req, res, next) => {
    const user = await User.findById(req.session.userId).exec();
    req.back = req.get("referer");
    app.locals.user = user;
    req.user = user;
    next();
});

app.use('/', routes);

app.use((req, res, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

process.on("uncaughtException", function (err) {
    
});

app.use((err, req, res, next) => {
    res.render("error", {error: err});
    next();
});


// listen on port {port} <- config
app.listen(config.port, function () {
    console.log('Express server started. Listing on port ' + config.port + '.');
});
