import { Queue } from "bullmq";
import { URL } from "url";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");

const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port),
  password: redisUrl.password || undefined,
};

export const emailQueue = new Queue("emails", { connection });
export { connection };
