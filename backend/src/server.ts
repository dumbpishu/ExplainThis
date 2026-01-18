import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectRedis } from "./config/redis.js";

const PORT = ENV.PORT;

const startServer = async () => {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
