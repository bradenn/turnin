var router = require('express').Router();
let User = require('../models/user');
let Topic = require('../models/topic');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    var e = {
      'published': true
    };
    if (req.query.s == "following") e = {
      $and: [{
        'owner': {
          $in: user.following
        }
      }, {
        'published': true
      }]
    };

    if (req.query.sec != null) e = {
      $and: [{
          'section': {
            $in: req.query.sec
          }
        },
        {
          'published': true
        }
      ]
    };
    Topic.find(e, function(err, topics) {
      Topic.find({
        published: true
      }, function(err, trending) {
        Topic.find({
          
        }, function(err, following) {
          return res.render("home", {
            title: "Name Brand News : Home",
            user: user,
            topics: topics,
            trending: trending,
            following: following,
            query: req.query.s,
            sec: req.query.sec
          });
        }).sort({
          views: -1,
          _id: -1
        }).limit(4);
      }).sort({
        views: -1,
        _id: -1
      }).limit(4);
    }).sort({
      _id: -1
    }).limit(8);
  });
});

module.exports = router;
