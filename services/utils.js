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

const tarF = multer({dest: 'uploads/'});

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
let postRouteWithUserAndTar = (route, router, cb) => {
    router.post(route, tarF.any(), (req, res) => {
        User.findById(req.session.userId, (err, user) => {
            cb(req, res, user);
        });
    });
};

let tar = require('tar');
let fs = require('fs');
let unpackTar = (file, cb) => {
    let dir = 'cache/'+file+"/";
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    fs.rename("uploads/" + file, "cache/" + file, ()=>{
        tar.x({file: "uploads/" + file, cwd: process.cwd() + "/cache/" + file}).then(_ => {
            fs.readdir("cache/" + file, (err, data) => {
                if(!data.find(dat => dat === "tests")){
                    fs.readdir("cache/"+data[0]+"/", (err, dataa) => {
                        cb(dataa);
                    });
                }else{
                    cb(data);
                }
            });
        });
    });
};

module.exports.getRouteWithUser = getRouteWithUser;
module.exports.postRouteWithUser = postRouteWithUser;
module.exports.unpackTar = unpackTar;
module.exports.postRouteWithUserAndFile = postRouteWithUserAndFile;
module.exports.postRouteWithUserAndFiles = postRouteWithUserAndFiles;
module.exports.postRouteWithUserAndTar = postRouteWithUserAndTar;
