let mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    return new Promise(async (resolve, reject) => {
        let user = await User.findOne({"username": {$regex: new RegExp(username, "i")}}).exec();
        if (!user) {
            let err = new Error('This user does not exist...');
            err.status = 401;
            reject(err);
        }
        if (await verifyHash(password, user.password)) {
            resolve(user);
        } else {
            let err = new Error("Your password is incorrect...");
            reject(err);
        }
    });
};

UserSchema.pre('save', async function (next) {
    let user = this;
    if (!user.isModified('password')) return next();
    user.password = await hashPassword(user.password);
    next();
});

let hashPassword = (password) => new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) reject(new Error(err));
        resolve(hash);
    });
});

let verifyHash = (password, original) => new Promise((resolve, reject) => {
    bcrypt.compare(password, original, function (err, result) {
        if (err) reject(new Error(err));
        resolve(result);
    });
});

let User = mongoose.model('User', UserSchema);

module.exports = User;
