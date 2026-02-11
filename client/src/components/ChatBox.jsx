import React, { useEffect, useState, useRef } from 'react'
import { socket } from "../lib/socket";
import { Send } from "lucide-react";

const ChatBox = ({ room = null, isGlobal = false, theme, username }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        const eventName = isGlobal ? "receive_global_message" : "receive_room_message";

        // Define the handler as a named function so we can remove it properly
        const onMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };

        socket.on(eventName, onMessage);

        if (isGlobal) {
            socket.emit("get_global_chat_history");
            socket.on("global_chat_history", (history) => {
                setMessages(history);
            });
        }

        return () => {
            socket.off(eventName, onMessage); // Clean up specific listener
            socket.off("global_chat_history");
        };
    }, [isGlobal, room]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const eventToSend = isGlobal ? "global_chat_message" : "send_room_message";
        socket.emit(eventToSend, {
            room, // Will be null for global
            text: input,
            username
        });
        setInput("");
    };
    return (
        <div
            className="flex flex-col h-full w-full rounded-2xl overflow-hidden border-2 transition-all duration-500"
            style={{
                backgroundColor: theme.boardColor + 'CC',
                borderColor: theme.borderColor
            }}
        >
            {/* Header */}
            <div
                className="p-3 border-b text-[10px] font-black uppercase tracking-widest text-center animate-pulse"
                style={{
                    borderColor: theme.borderColor,
                    color: theme.headingColor,
                    backgroundColor: theme.backgroundColor + '66'
                }}
            >
                {isGlobal ? "🌐 Global Transmission" : "📡 Secure Room Link"}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
                {messages.map((msg, i) => {
                    const isMe = msg.username === username;
                    return (
                        <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            <span
                                className="text-[9px] font-bold opacity-60 mb-1"
                                style={{ color: theme.subTextColor }}
                            >
                                {msg.username} • {msg.time || "Just now"}
                            </span>
                            <div
                                className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] border ${isMe ? "rounded-tr-none shadow-md" : "rounded-tl-none"
                                    }`}
                                style={{
                                    backgroundColor: isMe ? theme.buttonBg : theme.backgroundColor,
                                    color: isMe ? theme.buttonText : theme.textColor,
                                    borderColor: isMe ? theme.winLine : theme.borderColor
                                }}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="p-2 flex gap-2 border-t"
                style={{ borderColor: theme.borderColor, backgroundColor: theme.backgroundColor + '99' }}
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 bg-transparent px-3 py-2 outline-none text-sm font-medium"
                    style={{ color: theme.textColor }}
                />
                <button
                    type="submit"
                    className="p-2 rounded-lg transition-all active:scale-90"
                    style={{ backgroundColor: theme.winLine, color: theme.buttonText }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}

export default ChatBox
