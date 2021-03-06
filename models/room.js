var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    LastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
    Members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    Timestamp: {
        type: Date,
        required: true,
    },
});

RoomSchema.virtual('formatted_time').get(function () {
    return format(new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm");
});

//Export model
module.exports = mongoose.model('Room', RoomSchema);
