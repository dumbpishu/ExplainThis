import { createClient } from "redis";
import { ENV } from "./env";

export const redisClient = createClient({
  url: ENV.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Connected to Redis");
  }
};
