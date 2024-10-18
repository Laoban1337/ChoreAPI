const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    memberSince: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

// Pre-save hook for hashing password
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        // console.log('Plaintext password before hashing:', user.password); // Debugging line
        const hash = await bcrypt.hash(user.password, 10);
        // console.log('Hashed password:', hash); // Debugging line
        user.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
});

// Method to check encrypted password for login
userSchema.methods.checkPassword = async function (passwordAttempt) {
    try {
        const isMatch = await bcrypt.compare(passwordAttempt, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

// Method to remove password from user object
userSchema.methods.withoutPassword = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
