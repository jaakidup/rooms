const mongoose = require("mongoose")

const roomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
        min: 6,
        max: 255
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        min: 6,
        max: 255
    },
    // TODO: 
    // Find out how to reference the capacity field in this document model
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        max: 50
    }],
    capacity: {
        type: String,
        required: false,
        min: 2,
        max: 50,
        default: 5
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Room', roomSchema)