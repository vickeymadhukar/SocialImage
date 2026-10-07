import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;

if (process.env.REDIS_HOST || process.env.REDIS_URL) {
  const connectionConfig = process.env.REDIS_URL 
    ? { 
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => (retries > 1 ? false : 500),
        },
      }
    : {
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          reconnectStrategy: (retries) => (retries > 1 ? false : 500),
        },
      };

  redisClient = createClient(connectionConfig);

  redisClient.on("error", (err) => {
    // Only log if client is still open
    if (redisClient?.isOpen) {
      console.warn("Redis Error:", err.message || err);
    }
  });

  try {
    await redisClient.connect();
    console.log("Redis Connected successfully");
    isRedisConnected = true;
  } catch (error) {
    console.warn("Failed to connect to Redis on startup. Falling back to MongoDB directly.");
    try {
      if (redisClient) {
        await redisClient.disconnect();
      }
    } catch (_) {}
    redisClient = null;
    isRedisConnected = false;
  }
} else {
  console.log("Redis config (REDIS_HOST or REDIS_URL) not found. Using MongoDB directly.");
}

export const clearPostsCache = async () => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    let cursor = "0";
    do {
        const reply = await redisClient.scan(cursor, {
        MATCH: "posts:*",
        COUNT: 100,
      });
      cursor = reply.cursor;
      if (reply.keys && reply.keys.length > 0) {
        await redisClient.del(reply.keys);
      }
    } while (cursor !== "0" && cursor !== 0);
    console.log("Redis posts cache cleared successfully.");
  } catch (error) {
    console.error("Failed to clear Redis cache:", error.message || error);
  }
};

export { isRedisConnected };
export default redisClient;