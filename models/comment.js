var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    Content: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 200,
    },
    Picture: {
        type: String,
    },
    Author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    Post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    Likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Like',
        },
    ],
    Timestamp: {
        type: Date,
        required: true,
    },
});

CommentSchema.virtual('formatted_time').get(function () {
    return format(new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm");
});

//Export model
module.exports = mongoose.model('Comment', CommentSchema);
