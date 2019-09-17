let router = require('express').Router();
let User = require('../models/user');
let Topic = require('../models/topic');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (user == null) return res.redirect("/login");
    if (user.account == "user") return res.redirect("/login");

    return res.render("new", {
      title: "New",
      user: user
    });
  });
});

const upload = require('../services/aws-upload');
const singleUpload = upload.single('image');

router.post('/topic', upload.single('image'), function(req, res, next) {

  var img = (typeof req.file == "undefined") ? req.body.link : req.file.location;

  var tags = req.body.tags;
  var tagArray = tags.split(" ");
  var bannedWords = require("../banned-words.json");

  var standing = 0;
  let bodyText = req.body.body;

  bannedWords.words.forEach(function(wrd) {
    if (bodyText.includes(wrd)) {
      standing += (standing >= 2) ? 0 : 1;
    }
  });

  var topicData = {
    title: req.body.title,
    owner: req.session.userId,
    body: req.body.body,
    picture: img,
    desc: req.body.desc,
    section: req.body.section,
    standing: standing,
    tags: tagArray,
    views: 0,
    nsfw: (!req.body.nsfw) ? false : true,
    date: new Date()
  }

  Topic.create(topicData, function(error, topic) {
    if (error) {

    } else {
      return res.redirect("/topic/" + topic._id);
    }
  });

});

function getRand(t) {
  var c = t.length;
  var z = Math.floor(Math.random() * c);
  return t[z];
}

module.exports = router;
