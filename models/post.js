var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
    Content: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 1000,
    },
    Author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    TargetUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    Picture: {
        type: String,
    },
    Comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    Likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    Timestamp: {
        type: Date,
        required: true,
    },
    isAuth: {
        type: Boolean,
    },
    isLiked: {
        type: Boolean,
    },
});
/*
postSchema.virtual('url').get(function(){
              return '/post/' + this._id
           })
*/

PostSchema.virtual('formatted_time').get(function () {
    return format(new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm");
});

// filter Password field
PostSchema.methods.toJSON = function () {
    var obj = this.toObject(); //or var obj = this;
    delete obj.Author.Password;
    return obj;
};

//Export model
module.exports = mongoose.model('Post', PostSchema);
