const config = require("./env/env.js");
let express = require('express');
let app = express();
let methodOverride = require('method-override')
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let favicon = require('serve-favicon');
let platform = require("./env/platform.json");
let User = require('./models/user');


app.use(favicon(__dirname + '/public/images/favicon.ico'));

//connect to MongoDB
mongoose.connect(config.MONGO, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
let db = mongoose.connection;
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

app.use(methodOverride('X-HTTP-Method-Override'));

// parse incoming requests
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));

app.set('view engine', 'ejs');
// serve static files from template
app.use(express.static(__dirname + '/public'));

// include routes
let routes = require('./routes/');
let publicRoutes = require('./routes/public.js');

app.locals.platform = platform;
app.locals.platform.version = require("./package.json").version;
app.locals.platform.hostname = require('os').hostname();
app.locals.platform.instance = (process.env.NODE_ENV === "production")?process.env.INSTANCE_ID:"fork";

/* Send requests not requiring login */
app.use('/', publicRoutes);

app.use(async (req, res, next) => {
    const user = await User.findById(req.session.userId).exec();

    if (user == null){
        req.user = null;
        return res.redirect('/login');
    }

    req.back = req.get("referer");
    app.locals.user = user;
    req.user = user;
    next();
});

/* Send requests requiring login */
app.use('/', routes);

app.use((req, res, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

process.on("uncaughtException", function (err) {
    console.log(err);
});

app.use((err, req, res, next) => {
    res.render("error", {error: err});
    next();
});


// listen on port {port} <- config
app.listen(config.PORT, function () {
    console.log(`Turnin-gateway started. Listing on port ${config.PORT}.`);
});
