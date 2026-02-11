const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { signupSchema, loginSchema, validate } = require("../middleware/validate");

// SIGNUP
userRouter.post("/signup", validate(signupSchema), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Server error during registration" });
    }
});

// LOGIN
userRouter.post("/login", validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Short lived 15 mins
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Long lived 7 days
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            path: "/api/v1/user/refresh", // Only sent to the refresh endpoint
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "Login successful",
            user: { username: user.username, rank: user.rank, wins: user.wins }
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during login" });
    }
});

// REFRESH
userRouter.get("/refresh", async (req, res) => {
    const rfToken = req.cookies.refreshToken;
    if (!rfToken) return res.status(401).json({ error: "No refresh token" });

    try {
        const verified = jwt.verify(rfToken, process.env.REFRESH_SECRET);

        // Generate a fresh access token
        const newAccessToken = jwt.sign({ id: verified.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Token refreshed" });
    } catch (err) {
        res.status(403).json({ error: "Invalid refresh token" });
    }
});

// ME
userRouter.get("/me", authMiddleware, async (req, res) => {
    try {

        const user = await UserModel.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            user: {
                username: user.username,
                rank: user.rank,
                wins: user.wins
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// LOGOUT
userRouter.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("refreshToken", { path: "/api/v1/user/refresh" });
    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = userRouter;