var router = require('express').Router();
let faker = require("faker");
let User = require('../models/user');
let Topic = require('../models/topic');
let Comment = require('../models/comment');

router.get('/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    User.findOne({
      "username": {
        "$regex": req.params.id,
        "$options": 'i'
      }
    }, function(err, target) {
      Topic.find({
        owner: target._id
      }, function(err, topics) {
        Comment.find({
          user: target._id
        }, function(err, comments) {
          User.find({
            "following.id": {
              "$in": [target._id]
            }
          }, function(err, followers) {
            return res.render("user", {
              title: "User",
              user: user,
              target: target,
              topics: topics,
              comments: comments,
              followers: followers
            });
          });

        });
      });

    });
  });
});

router.get('/:action/:id', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    User.findById(req.params.id, function(err, target) {
      if (user.account == "superadmin") {
        switch (req.params.action) {
          case 'ban':
            target.account = 'banned';
            target.save(function(err){

            });
            break;
          case 'unban':
            target.account = 'user';
            target.save(function(err){

            });
            break;
        }
        res.redirect(req.get('referer'));
      }
    });
  });
});

router.get('/:id/:status', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
    if (req.params.status == "follow") {
      User.findByIdAndUpdate(req.session.userId, {
        $push: {
          following: [req.params.id]
        }
      }, function(err, user) {
        res.redirect(req.get('referer'));
      });
    } else if (req.params.status == "unfollow") {
      User.findByIdAndUpdate(req.session.userId, {
        $pullAll: {
          following: [req.params.id]
        }
      }, function(err, user) {
        res.redirect(req.get('referer'));
      });
    }
  });
});

module.exports = router;
