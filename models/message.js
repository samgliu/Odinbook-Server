var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    Text: {
        type: String,
        required: true,
    },
    SendBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    RoomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    Timestamp: {
        type: Date,
        required: true,
    },
});

RoomSchema.virtual('formatted_time').get(function () {
    return format(new Date(this.timestamp), "dd MMMM yyyy ' at ' HH:mm");
});

//Export model
module.exports = mongoose.model('Message', MessageSchema);
