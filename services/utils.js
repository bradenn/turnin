let User = require('../models/user');

let getRouteWithUser = (route, router, cb) => {
    router.get(route, (req, res) => {
        User.findById(req.session.userId, (err, user) => {
            cb(req, res, user);
        });
    });
};

let postRouteWithUser = (route, router, cb) => {
    router.post(route, (req, res) => {
        User.findById(req.session.userId, (err, user) => {
            cb(req, res, user);
        });
    });
};

const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

let postRouteWithUserAndFile = (route, router, cb) => {
    router.post(route, upload.single("image"), (req, res) => {
        User.findById(req.session.userId, (err, user) => {
            cb(req, res, user);
        });
    });
};

let postRouteWithUserAndFiles = (route, router, cb) => {
    router.post(route, upload.any(), (req, res) => {
        User.findById(req.session.userId, (err, user) => {
            cb(req, res, user);
        });
    });
};

module.exports.getRouteWithUser = getRouteWithUser;
module.exports.postRouteWithUser = postRouteWithUser;
module.exports.postRouteWithUserAndFile = postRouteWithUserAndFile;
module.exports.postRouteWithUserAndFiles = postRouteWithUserAndFiles;
