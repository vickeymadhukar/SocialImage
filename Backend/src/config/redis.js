import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;

if (process.env.REDIS_HOST || process.env.REDIS_URL) {
  const connectionConfig = process.env.REDIS_URL 
    ? { url: process.env.REDIS_URL }
    : {
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      };

  redisClient = createClient(connectionConfig);

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err.message || err);
  });

  try {
    await redisClient.connect();
    console.log("Redis Connected successfully");
    isRedisConnected = true;
  } catch (error) {
    console.error("Failed to connect to Redis on startup:", error.message || error);
  }
} else {
  console.log("Redis config (REDIS_HOST or REDIS_URL) not found. Skipping Redis connection.");
}

export { isRedisConnected };
export default redisClient;