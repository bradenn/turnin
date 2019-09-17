const config = require("../config.json");
let express = require('express');
let router = express.Router();

// Load all pages and their routes from config file
for (let i = 0; i < config.pages.length; i++) {
  router.use(config.pages[i].url, require(config.pages[i].route));
}

router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
