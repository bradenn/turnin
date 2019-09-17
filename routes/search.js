var router = require('express').Router();
let User = require('../models/user');
let Topic = require('../models/topic');

router.get('/', function(req, res, next) {
  User.findById(req.session.userId, function(err, user) {
      Topic.find({
          $or: [{
            "title": {
              "$regex": req.query.q,
              "$options": 'i'
            }
          }, {
            "body": {
              "$regex": req.query.q,
              "$options": 'i'
            }
          }]
        },
        function(err, topics) {
          User.find({
              "username": {
                "$regex": req.query.q,
                "$options": 'i'
              }
            },
            function(err, users) {
              return res.render("search", {
                title: "Search",
                user: user,
                topics: topics,
                query: req.query.q,
                users: users
              });
            });

        });

  });
});

module.exports = router;
