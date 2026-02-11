const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Platinum", "Neural Legend"],
        default: "Bronze"
    },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
}, { timestamps: true });

const UserModel = model('User', UserSchema);
module.exports = UserModel;