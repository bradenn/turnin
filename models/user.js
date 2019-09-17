const config = require("../config.json");
let crypto = require('crypto');
let mongoose = require('mongoose');
let autopopulate = require('mongoose-autopopulate');

// Define schema for `user` database collection
let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    autopopulate: true
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: true
  }],
  saved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  firstname: String,
  lastname: String,
  password: String,
  picture: String,
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark'
  },
  account: {
    type: String,
    enum: ['banned', 'user', 'writer', 'admin', 'superadmin'],
    default: 'user'
  },
  date: String
});

// Load plugin to automatically populate nested queries
UserSchema.plugin(autopopulate);

// Handle Authentication by verifying password hash
UserSchema.statics.authenticate = function(username, password, callback) {
  User.findOne({ "username" : { $regex : new RegExp(username, "i") } })
    .exec(function(err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      if (verifyHash(password, user.password)) {
        return callback(null, user);
      } else {
        callback();
      }
    });
}

// Hash password on password change
UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  user.password = hashPassword(user.password);
  next();
});

// Convert plaintext password to hash
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
  return [salt, hash].join('$');
}

// Compare input hashed password with database hashed password
function verifyHash(password, original) {
  const originalHash = original.split('$')[1];
  const salt = original.split('$')[0];
  const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');

  return hash === originalHash

}

var User = mongoose.model('User', UserSchema);

module.exports = User;
