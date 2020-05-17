const config = require("./env/env.js");
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let compression = require('compression');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let favicon = require('serve-favicon');
let platform = require("./env/platform.json");
let User = require('./models/user');
let Course = require('./models/course');

app.use(compression());
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
app.locals.platform.instance = (process.env.NODE_ENV === "production") ? process.env.INSTANCE_ID : "fork";

/* Send requests not requiring login */
app.use('/', publicRoutes);

app.use(async (req, res, next) => {
    const user = await User.findById(req.session.userId).populate('courses').exec();
    let courses = await Course.find({instructor: req.session.userId}).exec();
    if (user == null) {
        req.user = null;
        return res.redirect('/login');
    }

    app.locals.info = req.session.info;
    app.locals.error = req.session.error;
    req.session.info = null;
    req.session.error = null;
    app.locals.url = req.url;
    app.locals.user = user;
    app.locals.user.instructing = courses;
    req.user = user;


    req.back = req.get("referer");
    app.locals.back = req.back;
    next();
});

/* Send requests requiring login */
app.use('/', routes);

app.use((req, res, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.render("error", {error: err});
    next();
});

// listen on port {port} <- config
app.listen(config.PORT, function () {
    console.log(`Turnin-gateway started. Listing on port ${config.PORT}.`);
});
