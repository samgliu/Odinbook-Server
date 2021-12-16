var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    Firstname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Lastname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Username: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 100,
    },
    Email: {
        type: String,
        minlength: 3,
        maxLength: 100,
    },
    Password: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 100,
    },
    Avatar: {
        type: String,
    },
    Friends: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    FriendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    Posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
});

// filter Password field
UserSchema.methods.toJSON = function () {
    var obj = this.toObject(); //or var obj = this;
    delete obj.Password;
    return obj;
};

//Export model
module.exports = mongoose.model('User', UserSchema);
