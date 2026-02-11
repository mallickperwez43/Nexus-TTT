const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const socketAuth = async (socket, next) => {
    try {
        const rawCookies = socket.handshake.headers.cookie;

        if (!rawCookies) {
            return next(new Error("Authentication error: No cookies found"));
        }

        const parsedCookies = cookie.parse(rawCookies);
        const token = parsedCookies.token;

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: Check if user still exists in DB
        const user = await UserModel.findById(decoded.id).select("username");
        if (!user) {
            return next(new Error("Authentication error: User no longer exists"));
        }

        socket.userId = decoded.id;
        socket.username = user.username; // Useful for chat messages

        next();

    } catch (error) {
        console.error("Socket Middleware Error:", error.message);
        return next(new Error("Authentication error"));
    }
};

module.exports = socketAuth;