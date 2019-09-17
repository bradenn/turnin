var router = require('express').Router();
let User = require('../models/user');
let Topic = require('../models/topic');

router.get('/', function(req, res, next) {
  return res.render("banned", {
    title: 'banned',
    user: null
  });
});

module.exports = router;
