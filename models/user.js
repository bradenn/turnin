const config = require("../env/config.json");
let crypto = require('crypto');
let mongoose = require('mongoose');

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
    type: {
        type: Number,
        default: 0
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    darkmode: {
        type: Boolean,
        default: true
    },
    github: String,
    firstname: String,
    lastname: String,
    password: String,
    date: String
});

UserSchema.statics.authenticate = async (username, password) => {
    return new Promise((resolve, reject) => {
        User.findOne({"username": {$regex: new RegExp(username, "i")}})
            .exec(function (err, user) {
                if (err) reject(err);
                if (!user) {
                    let err = new Error('This user does not exist...');
                    err.status = 401;
                    reject(err);
                }
                if (verifyHash(password, user.password)) {
                    resolve(user);
                } else {
                    let err = new Error("Your password is incorrect...");
                    reject(err);
                }
            });
    });
};

// Hash password on password change
UserSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password')) return next();
    user.password = hashPassword(user.password);
    next();
});

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');
    return [salt, hash].join('$');
}

function verifyHash(password, original) {
    const originalHash = original.split('$')[1];
    const salt = original.split('$')[0];
    const hash = crypto.pbkdf2Sync(password, salt, 2048, 32, 'sha512').toString('hex');

    return hash === originalHash

}

let User = mongoose.model('User', UserSchema);

module.exports = User;
