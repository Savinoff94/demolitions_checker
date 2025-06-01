import { Redis } from 'ioredis'
import { Queue } from 'bullmq'
import {
  ParsingQueueData,
  AiEvaluetionQueueData,
  ResultsQueueData,
  RedisCacheSchema,
  RedisKey
} from '@org/types'

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
})

export const typedRedis = {
  set: async function <K extends RedisKey>(key: K, value: RedisCacheSchema[K], cacheTime: number) {
    await redisClient.set(key, JSON.stringify(value), 'PX', cacheTime);
  },

  get: async function <K extends RedisKey>(key: K) {
    const val = await redisClient.get(key)
    return val ? JSON.parse(val) as RedisCacheSchema[K] : null
  },

  keyExists: async function <K extends RedisKey>(key: K) : Promise<boolean> {
    const val = await redisClient.exists(key)
    return Boolean(val)
  }
}

export const parsingQueue = new Queue<ParsingQueueData>('parsingQueue', {
  connection: redisClient,
})

export const aiEvaluationQueue = new Queue<AiEvaluetionQueueData>('aiEvaluationQueue', {
  connection: redisClient,
})

export const resultsQueue = new Queue<ResultsQueueData>('resultsQueue', {
  connection: redisClient,
})

redisClient.on('connect', () => console.log('Connected to Redis'))
redisClient.on('error', (err) => console.error('Redis error:', err))
