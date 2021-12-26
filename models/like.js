var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LikeSchema = new Schema({
    Author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    Post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
    },
    Comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    Timestamp: {
        type: Date,
        required: true,
    },
});

LikeSchema.virtual('formatted_time').get(function () {
    return format(new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm");
});

//Export model
module.exports = mongoose.model('Like', LikeSchema);
