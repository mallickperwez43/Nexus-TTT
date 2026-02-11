import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useGameStore } from "../store/useGameStore";
import { socket } from "../lib/socket";
import { Copy, Check, ArrowRight, Trophy, Zap } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import ChatBox from "@/components/ChatBox";

const LobbyScreen = () => {
    const { user, logout } = useAuthStore();
    const [roomInput, setRoomInput] = useState("");
    const [generatedCode, setGeneratedCode] = useState(null);
    const [copied, setCopied] = useState(false);
    const [gridSize, setGridSize] = useState(3); // Default 3x3
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState("lobby"); // "lobby" or "leaderboard"

    const navigate = useNavigate();
    const { currentTheme, themeConfig } = useThemeStore();
    const setMultiplayer = useGameStore((state) => state.setMultiplayer);
    const theme = themeConfig[currentTheme];

    const handleCreateRoom = () => {
        const newCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        setGeneratedCode(newCode);

        // Connect and Join with REAL username
        socket.connect();
        socket.emit("join_room", {
            room: newCode,
            username: user?.username || "Guest",
            gridSize: gridSize
        });
        setMultiplayer(newCode, 'X', gridSize);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const joinRoom = (roomCode, symbol = 'O') => {
        if (roomCode !== "") {
            socket.connect();
            socket.emit("join_room", {
                room: roomCode,
                username: user?.username || "Guest" // Use store data
            });
            setMultiplayer(roomCode, symbol);
            navigate(`/game?room=${roomCode}`);
        }
    };

    useEffect(() => {
        // Force connect so Global Chat works immediately
        if (!socket.connected) {
            socket.connect();
        }

        // Request global chat history
        socket.emit("get_global_chat_history");

        // Listen for leaderboard updates
        socket.on("update_leaderboard", (data) => {
            console.log("📊 Leaderboard updated, received", data?.length || 0, "players:", data);
            setLeaderboard(data || []);
        });

        // Request initial leaderboard data
        console.log("📤 Requesting initial leaderboard");
        socket.emit("get_leaderboard");

        socket.on("connect_error", (err) => {
            if (err.message.includes("Authentication error")) {
                navigate("/login");
            }
        });

        return () => {
            socket.off("connect_error");
            socket.off("update_leaderboard");
        };
    }, [navigate]);

    return (
        <div className="min-h-dvh w-full flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: theme.backgroundColor || theme.boardColor }}>
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase" style={{ color: theme.headingColor }}>
                        Nexus Net
                    </h2>
                    <p className="text-[10px] font-bold tracking-[0.4em] opacity-40 uppercase" style={{ color: theme.headingColor }}>
                        Multiplayer Gateway
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: theme.headingColor }}
                >
                    Terminate Session [Logout]
                </button>

                {/* Tab Navigation */}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => setActiveTab("lobby")}
                        className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${activeTab === "lobby" ? "scale-105" : "opacity-40"
                            }`}
                        style={{
                            backgroundColor: activeTab === "lobby" ? theme.winLine : "rgba(255,255,255,0.05)",
                            color: activeTab === "lobby" ? "#000" : theme.textColor,
                        }}
                    >
                        🎮 Lobby
                    </button>
                    <button
                        onClick={() => setActiveTab("leaderboard")}
                        className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${activeTab === "leaderboard" ? "scale-105" : "opacity-40"
                            }`}
                        style={{
                            backgroundColor: activeTab === "leaderboard" ? theme.winLine : "rgba(255,255,255,0.05)",
                            color: activeTab === "leaderboard" ? "#000" : theme.textColor,
                        }}
                    >
                        🏆 Leaderboard
                    </button>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === "lobby" ? (
                            // LOBBY CONTENT
                            !generatedCode ? (
                                <div className="flex flex-col gap-4">
                                    {/* JOIN SECTION */}
                                    <div className="p-1 rounded-2xl border-2 border-dashed border-white/10">
                                        <input
                                            type="text"
                                            placeholder="ENTER CODE"
                                            value={roomInput}
                                            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                                            className="w-full bg-transparent p-4 text-center font-black tracking-[0.5em] outline-none"
                                            style={{ color: theme.textColor }}
                                        />
                                        <button
                                            onClick={() => joinRoom(roomInput)}
                                            className="w-full py-4 rounded-xl font-black uppercase text-xs transition-all active:scale-95"
                                            style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
                                        >
                                            Join Existing Room
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 opacity-20">
                                        <hr className="flex-1" /> <span className="text-[10px] font-black" style={{ color: theme.headingColor }}>OR</span> <hr className="flex-1" />
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-center opacity-40" style={{ color: theme.headingColor }}>
                                            Select Grid Dimensions
                                        </p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => setGridSize(size)}
                                                    className={`py-3 rounded-xl font-black transition-all border-2 ${gridSize === size
                                                        ? 'scale-105 shadow-lg'
                                                        : 'opacity-40 border-transparent hover:opacity-100'
                                                        }`}
                                                    style={{
                                                        backgroundColor: gridSize === size ? theme.winLine : 'rgba(255,255,255,0.05)',
                                                        color: theme.headingColor,
                                                        borderColor: gridSize === size ? theme.winLine : 'transparent'
                                                    }}
                                                >
                                                    {size}x{size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateRoom}
                                        className="w-full py-5 rounded-2xl border-2 font-black uppercase tracking-widest transition-all hover:bg-white/5 active:scale-95"
                                        style={{ borderColor: theme.winLine, color: theme.winLine }}
                                    >
                                        Create New Room
                                    </button>
                                </div>
                            ) : (
                                /* DISPLAY GENERATED CODE SECTION */
                                <div className="p-8 rounded-3xl border-2 border-white/5 bg-white/5 backdrop-blur-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                                    <p className="text-[12px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.headingColor }}>Share this link/code</p>

                                    <div className="text-6xl font-black tracking-[0.2em] py-2" style={{ color: theme.xColor }}>
                                        {generatedCode}
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                                            style={{ backgroundColor: `${theme.xColor}22`, color: theme.xColor }}
                                        >
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                            {copied ? "Copied!" : "Copy Code"}
                                        </button>

                                        <button
                                            onClick={() => navigate(`/game?room=${generatedCode}`)}
                                            className="flex-1 py-4 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                                            style={{ backgroundColor: theme.winLine, color: "#000" }}
                                        >
                                            Enter Game <ArrowRight size={16} />
                                        </button>
                                    </div>

                                    <p className="text-[12px] text-center opacity-40 leading-relaxed" style={{ color: theme.headingColor }}>
                                        The game will begin once your opponent <br /> connects to this room.
                                    </p>
                                </div>
                            )
                        ) : (
                            // LEADERBOARD CONTENT
                            <div className="p-6 rounded-3xl border-2 border-white/5 bg-white/5 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Trophy size={28} style={{ color: theme.winLine }} />
                                        <h3 className="text-2xl font-black uppercase italic tracking-tight" style={{ color: theme.headingColor }}>
                                            Top Players
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            console.log("🔄 Manual refresh requested");
                                            socket.emit("get_leaderboard");
                                        }}
                                        className="px-3 py-1 rounded-lg text-xs font-black uppercase opacity-40 hover:opacity-100 transition-opacity"
                                        style={{ backgroundColor: "rgba(255,255,255,0.1)", color: theme.textColor }}
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>

                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-12 opacity-40">
                                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.textColor }}>
                                            No data yet
                                        </p>
                                        <p className="text-xs mt-2" style={{ color: theme.textColor }}>
                                            Be the first to win!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {leaderboard.map((player, index) => {
                                            const isCurrentUser = player.username === user?.username;
                                            const medals = ["🥇", "🥈", "🥉"];

                                            return (
                                                <div
                                                    key={player._id || index}
                                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrentUser ? "border-2 scale-105" : "border border-white/5"
                                                        }`}
                                                    style={{
                                                        backgroundColor: isCurrentUser ? `${theme.winLine}22` : "rgba(0,0,0,0.2)",
                                                        borderColor: isCurrentUser ? theme.winLine : "transparent"
                                                    }}
                                                >
                                                    {/* Rank */}
                                                    <div className="text-2xl font-black w-12 text-center">
                                                        {index < 3 ? medals[index] : `#${index + 1}`}
                                                    </div>

                                                    {/* Username */}
                                                    <div className="flex-1">
                                                        <p className="font-black uppercase tracking-wide"
                                                            style={{ color: isCurrentUser ? theme.winLine : theme.textColor }}>
                                                            {player.username}
                                                            {isCurrentUser && <span className="ml-2 text-[10px] opacity-50">(YOU)</span>}
                                                        </p>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1">
                                                            <Trophy size={14} style={{ color: theme.xColor }} />
                                                            <span className="font-black text-sm" style={{ color: theme.xColor }}>
                                                                {player.wins || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Zap size={14} style={{ color: theme.oColor }} />
                                                            <span className="font-black text-sm" style={{ color: theme.oColor }}>
                                                                {player.xp || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat Sidebar */}
                    <div className="lg:col-span-1">
                        <ChatBox isGlobal={true} theme={theme} username={user?.username} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;