const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
        // this would stop someone from using the same email as someone else already in the database
    }
});
UserSchema.plugin(passportLocalMongoose);
// we are adding the package passportLocalMongoose to the plugin of our UserSchema
// this is going to add onto our schema a username, and a password
// with this package, we will also get some new methods on our Schema

module.exports = mongoose.model('User', UserSchema);
































