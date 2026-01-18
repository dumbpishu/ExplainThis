import { createClient } from "redis";
import { ENV } from "./env.js";

export const redisClient = createClient({
  url: ENV.REDIS_URL,
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
