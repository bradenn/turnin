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
    router.post(route, upload.any(), (req, res, next) => {
        User.findById(req.session.userId, (err, user) => {
            cb(req, res, user, next);
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
let unpackTar = (file, original, cb) => {
    tar.extract({
        file: file,
        cwd: `${process.cwd()}/cache/`
    }).then((e) => {
        fs.readdir(`${process.cwd()}/cache/${original.replace(".tar", "")}/tests`, (err, files) => {
            let regex = new RegExp(`^((?!\.\_).)*$`);
            let testFiles = files.filter((file) => regex.exec(file));
            let tests = [];
            testFiles.forEach(file => {
                let b = false;
                for (let i = 0; i < tests.length; i++) {
                    if (file.includes(tests[i].name)) {
                        tests[i].files.push(file);
                        b = true;
                    }
                }
                if (!b) {
                    tests.push({name: file.split(".")[0], files: [file]});
                }
            });
            console.log(tests);
            cb(tests);
        });
    });
};

let readFile = (test) => {
    let inputFile = "./cache/" + test;
    let output = {lines: []};
    try {
        const input = fs.readFileSync(inputFile, 'UTF-8');
        let lines = input.split(/\r?\n/);
        lines.forEach((ln) => {
            output.lines.push(ln);
        });
    } catch (err) {
        console.error(err);
    }

    return output;
};


module.exports.readFile = readFile;
module.exports.getRouteWithUser = getRouteWithUser;
module.exports.postRouteWithUser = postRouteWithUser;
module.exports.unpackTar = unpackTar;
module.exports.postRouteWithUserAndFile = postRouteWithUserAndFile;
module.exports.postRouteWithUserAndFiles = postRouteWithUserAndFiles;
module.exports.postRouteWithUserAndTar = postRouteWithUserAndTar;
