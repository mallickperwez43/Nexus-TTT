const UserModel = require("../models/User");
const redis = require("../lib/redis");
const { syncGameState } = require("../utils/gameState");

// Helper to get players in guaranteed role-aligned order: ['X' player, 'O' player]
const getSortedPlayers = async (room, playersKey, rolesKey) => {
    const players = await redis.sMembers(playersKey);
    const sortedPlayers = [null, null];
    for (const p of players) {
        const r = await redis.hGet(rolesKey, p);
        if (r === "X") {
            sortedPlayers[0] = p;
        } else if (r === "O") {
            sortedPlayers[1] = p;
        } else {
            // spectator or extra
            if (!sortedPlayers[0]) sortedPlayers[0] = p;
            else if (!sortedPlayers[1]) sortedPlayers[1] = p;
        }
    }
    return sortedPlayers;
};

module.exports = (io, socket) => {
    // --- 1. ROOM LOGIC ---
    socket.on("join_room", async (data) => {
        const { room, username = "Guest", gridSize = 3 } = data || {};
        if (!room) return;

        await socket.join(room); // Join first

        const roomKey = `room:${room}:metadata`;
        const playersKey = `room:${room}:players`;
        const rolesKey = `room:${room}:roles`;

        try {
            // Check for duplicate usernames to guarantee uniqueness in the set
            let finalUsername = username;
            if (socket.data.room === room && socket.data.username === username) {
                finalUsername = username;
            } else {
                const isDuplicate = await redis.sIsMember(playersKey, String(finalUsername));
                if (isDuplicate) {
                    const randomId = Math.floor(1000 + Math.random() * 9000);
                    finalUsername = `${username}#${randomId}`;
                }
            }

            socket.data.room = room;
            socket.data.username = finalUsername;

            // Add player to Redis set of active players
            await redis.sAdd(playersKey, String(finalUsername));

            // Assign role dynamically or retrieve existing role
            let role = await redis.hGet(rolesKey, String(finalUsername));
            if (!role) {
                const activePlayers = await redis.sMembers(playersKey);
                const activeRoles = [];
                for (const p of activePlayers) {
                    if (p !== finalUsername) {
                        const r = await redis.hGet(rolesKey, p);
                        if (r) activeRoles.push(r);
                    }
                }

                if (!activeRoles.includes("X")) {
                    role = "X";
                } else if (!activeRoles.includes("O")) {
                    role = "O";
                } else {
                    role = "O"; // Default to "O" for spectator/extra players
                }
                await redis.hSet(rolesKey, String(finalUsername), role);
            }

            // Send role assignment back to the joining socket
            socket.emit("role_assignment", { role });

            // Fetch fresh list of active players in role-sorted order
            const players = await getSortedPlayers(room, playersKey, rolesKey);
            const actualPlayerCount = players.filter(Boolean).length;

            const savedGridSize = await redis.hGet(roomKey, "gridSize") || gridSize;

            const statusUpdate = {
                count: actualPlayerCount,
                players: players,
                gridSize: parseInt(savedGridSize),
                message: actualPlayerCount >= 2 ? "Ready!" : "Waiting..."
            };

            // Emit to EVERYONE in the room (including the joining player)
            io.to(room).emit("room_status", statusUpdate);

            // Authoritative sync for the new player
            await syncGameState(io, room, redis);

        } catch (error) {
            console.error("Redis Join Error", error);
        }
    });

    socket.on("disconnecting", async () => {
        const { room, username } = socket.data;

        if (room) {
            const playersKey = `room:${room}:players`;
            const historyKey = `game:${room}:history`;

            await redis.sRem(playersKey, String(username));
            const remainingMembers = await redis.sMembers(playersKey);

            // If the room is completely empty, clean up everything
            if (remainingMembers.length === 0) {
                await redis.del(`room:${room}:metadata`);
                await redis.del(`room:${room}:players`);
                await redis.del(`room:${room}:roles`);
                await redis.del(`game:${room}:history`);
                await redis.del(`game:${room}:future`);
                return;
            }

            // CHECK: Has the game actually started?
            const history = await redis.lRange(historyKey, 0, -1);
            const gameInProgress = history.length > 0;

            if (remainingMembers.length === 1 && gameInProgress) {
                const winnerUsername = remainingMembers[0];
                try {
                    // Only reward if it was a real match
                    await UserModel.findOneAndUpdate(
                        { username: winnerUsername },
                        { $inc: { wins: 1, xp: 100 } }
                    );

                    // Broadcast leaderboard update
                    const leaderboard = await UserModel.find()
                        .sort({ wins: -1, xp: -1 })
                        .limit(10)
                        .select('username wins xp rank');
                    io.emit("update_leaderboard", leaderboard);

                    socket.to(room).emit("opponent_left_win", {
                        winner: winnerUsername,
                        message: `${username} fled the battle! You win by forfeit.`
                    });
                } catch (err) {
                    console.error("Forfeit reward error:", err);
                }
            }

            // Fetch sorted remaining players list
            const remainingPlayers = await getSortedPlayers(room, playersKey, rolesKey);

            // Standard status update
            socket.to(room).emit("room_status", {
                count: remainingMembers.length,
                players: remainingPlayers,
                message: `${username} left.`
            });
        }
    });

    // --- 2. AUTHORITATIVE GAMEPLAY LOGIC ---
    socket.on("send_move", async (data) => {
        const { room, index } = data;
        const historyKey = `game:${room}:history`;
        const futureKey = `game:${room}:future`;

        // Determine symbol based on history length (X always starts)
        const historyRaw = await redis.lRange(historyKey, 0, -1);
        const symbol = historyRaw.length % 2 === 0 ? "X" : "O";

        // Push move to Redis History and clear the Redo (future) stack
        await redis.rPush(historyKey, JSON.stringify({ index, symbol }));
        await redis.del(futureKey);

        // Tell EVERYONE in the room what the new "Truth" is
        await syncGameState(io, room, redis);
    });

    socket.on("request_undo", async (data) => {
        const { room } = data;
        // Atomic: Move last move from history to future (redo stack)
        await redis.rPopLPush(`game:${room}:history`, `game:${room}:future`);
        await syncGameState(io, room, redis);
    });

    socket.on("request_redo", async (data) => {
        const { room } = data;
        // Atomic: Move last move from future back to history
        await redis.rPopLPush(`game:${room}:future`, `game:${room}:history`);
        await syncGameState(io, room, redis);
    });

    socket.on("reset_game", async (data) => {
        const { room } = data;
        // Wipe the stacks in Redis
        await redis.del(`game:${room}:history`);
        await redis.del(`game:${room}:future`);
        await syncGameState(io, room, redis);
    });

    // --- 3. CHAT & LEADERBOARD  ---
    socket.on("send_room_message", (data) => {
        const { room, text, username } = data;
        if (!room || !text) return;

        // Send only to the specific room
        io.to(room).emit("receive_room_message", {
            username: String(username),
            text: String(text),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on("record_win", async (data) => {
        console.log("📥 Received record_win event:", data);
        const { username } = data;

        if (!username) {
            console.error("❌ No username provided in record_win");
            return;
        }

        try {
            const result = await UserModel.findOneAndUpdate(
                { username },
                { $inc: { wins: 1, xp: 100 } },
                { new: true } // Return the updated document
            );

            if (!result) {
                console.error(`❌ User not found: ${username}`);
                return;
            }

            console.log(`✅ Updated user ${username}: wins=${result.wins}, xp=${result.xp}`);

            const leaderboard = await UserModel.find()
                .sort({ wins: -1, xp: -1 })
                .limit(10)
                .select('username wins xp rank');

            console.log("📊 Broadcasting leaderboard update:", leaderboard.length, "players");

            io.emit("update_leaderboard", leaderboard);
        } catch (err) {
            console.error("❌ Win record error:", err);
        }
    });

    socket.on("get_leaderboard", async () => {
        console.log("📥 Received get_leaderboard request");
        try {
            const leaderboard = await UserModel.find()
                .sort({ wins: -1, xp: -1 })
                .limit(10)
                .select('username wins xp rank');

            console.log("📊 Sending leaderboard:", leaderboard.length, "players");

            socket.emit("update_leaderboard", leaderboard);
        } catch (err) {
            console.error("❌ Get leaderboard error:", err);
        }
    });

    // --- 4. DISCONNECT LOGIC ---
    socket.on("leave_room", async (data) => {
        const { room } = data;
        const { username } = socket.data; // Get username from socket.data

        if (!room || !username) return;

        socket.leave(room);

        const playersKey = `room:${room}:players`;
        await redis.sRem(playersKey, String(username)); // Remove from Redis set

        const remainingMembers = await redis.sMembers(playersKey);
        const remainingSize = io.sockets.adapter.rooms.get(room)?.size || 0;

        if (remainingMembers.length === 0) {
            await redis.del(`room:${room}:metadata`);
            await redis.del(`room:${room}:players`);
            await redis.del(`room:${room}:roles`);
            await redis.del(`game:${room}:history`);
            await redis.del(`game:${room}:future`);
        } else {
            const remainingPlayersList = await getSortedPlayers(room, playersKey, rolesKey);
            io.to(room).emit("room_status", {
                count: remainingSize,
                players: remainingPlayersList,
                message: "Opponent left."
            });
        }
    });

    // --- 5. GLOBAL CHAT LOGIC ---
    socket.on("global_chat_message", async (data) => {
        try {
            const { username, text } = data;
            if (!text || !username) return;

            const chatMessage = {
                username: String(username),
                text: String(text),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: Date.now() // Unique ID for React keys
            };

            // Store in Redis (Key: global_chat_history)
            // We use LPUSH to add to the front and LTRIM to keep only 20
            await redis.lPush("global_chat_history", JSON.stringify(chatMessage));
            await redis.lTrim("global_chat_history", 0, 19);

            // Broadcast to EVERYONE connected
            io.emit("receive_global_message", chatMessage);
        } catch (err) {
            console.error("Global Chat Error:", err);
        }
    });

    socket.on("get_global_chat_history", async () => {
        const history = await redis.lRange("global_chat_history", 0, -1);
        const parsedHistory = history.map(msg => JSON.parse(msg)).reverse();
        socket.emit("global_chat_history", parsedHistory);
    });
};