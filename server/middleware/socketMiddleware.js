const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const socketAuth = async (socket, next) => {
    try {
        let token = null;

        const rawCookies = socket.handshake.headers.cookie;

        if (rawCookies) {
            const parsedCookies = cookie.parse(rawCookies);
            token = parsedCookies.token;
        }

        if (!token) {
            token = socket.handshake.auth?.token || socket.handshake.query?.token;
        }

        if (!token) {
            console.log("❌ No token found in cookies, handshake auth, or query parameters");
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