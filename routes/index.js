const config = require("../env/pages.json");
let express = require('express');
let router = express.Router();

// Load all pages and their routes from config file
for (let i = 0; i < config.pages.length; i++) {
  router.use(config.pages[i].url, require(config.pages[i].route));
}

// Default logout
router.get('/logout', function(req, res, next) {
  // Check if session is alive
  if (req.session) {
    // Destory session
    req.session.destroy(function(err) {
      if (err) {
        next(err);
      } else {
        res.redirect('/');
      }
    });
  }
});

module.exports = router;
