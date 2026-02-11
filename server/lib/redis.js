const { createClient } = require('redis');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// console.log("Checking REDIS_URL:", process.env.REDIS_URL ? "URL Found ✅" : "URL NOT FOUND ❌");

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false,
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error("Redis connection failed");
            return Math.min(retries * 100, 3000); // Exponential backoff
        }
    },
    pingInterval: 50000,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Upstash Redis 🚀");
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
})();

module.exports = redisClient;