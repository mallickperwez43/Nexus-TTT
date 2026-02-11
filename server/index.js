const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
const connectDB = require("./connectDB");
const userRouter = require("./routes/userRoutes");
const registerSocketHandlers = require("./socket/gameHandlers");
const socketAuth = require("./middleware/socketMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URI || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use("/api/v1/user", userRouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URI || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
});
console.log("RAW ENV URI:", process.env.CLIENT_URI);
console.log("CORS Origin being used:", process.env.CLIENT_URI);
io.use(socketAuth);

// Socket.io Connection
io.on("connection", (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Pass the socket to our modular handler
    registerSocketHandlers(io, socket);

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                const remainingSize = (io.sockets.adapter.rooms.get(room)?.size || 1) - 1;
                io.to(room).emit("room_status", { count: remainingSize, message: "Disconnected." });
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Neural Server at ${PORT}`));