const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
            token = parts[1];
        }
    }

    if (!token) return res.status(401).json({ error: "Session expired. Please login." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verified.id;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid session" });
    }
};