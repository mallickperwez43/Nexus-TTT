const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const socketAuth = async (socket, next) => {
    try {
        const rawCookies = socket.handshake.headers.cookie;

        if (!rawCookies) {
            console.log("❌ No cookies in handshake");
            return next(new Error("Authentication error: No cookies found"));
        }

        const parsedCookies = cookie.parse(rawCookies);
        const token = parsedCookies.token;

        if (!token) {
            console.log("❌ Token not found in cookies");
            return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await UserModel.findById(decoded.id).select("username");
        if (!user) {
            return next(new Error("Authentication error: User no longer exists"));
        }

        socket.userId = decoded.id;
        socket.username = user.username;
        socket.data.username = user.username;

        console.log("✅ Socket authenticated:", user.username);
        next();

    } catch (error) {
        console.error("❌ Socket auth error:", error.message);
        return next(new Error("Authentication error"));
    }
};

module.exports = socketAuth;