import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,

})

redisClient.on('error', (err) => console.log('Redis client error', err));
redisClient.on('connect', () => console.log('Redis client connected'));

export async function connectRedis() {
  if(!redisClient.isOpen) {
    await redisClient.connect();
  } 
}
