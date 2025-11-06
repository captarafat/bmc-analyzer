import { NextResponse } from 'next/server';
import { redis } from '../../../lib/db';

export async function GET() {
  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;
  const isRedisReady = !!redis;

  if (!hasUrl || !hasToken) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing environment variables',
      details: {
        hasUrl,
        hasToken,
        urlLength: hasUrl ? process.env.UPSTASH_REDIS_REST_URL.length : 0,
        tokenLength: hasToken ? process.env.UPSTASH_REDIS_REST_TOKEN.length : 0,
      },
      fix: 'Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel Environment Variables',
    }, { status: 500 });
  }

  if (!isRedisReady) {
    return NextResponse.json({
      status: 'error',
      message: 'Redis client not initialized',
      details: { hasUrl, hasToken },
    }, { status: 500 });
  }

  try {
    // Test Redis connection
    const testKey = 'test:connection';
    await redis.set(testKey, 'ok', { ex: 10 });
    const testValue = await redis.get(testKey);
    await redis.del(testKey);

    return NextResponse.json({
      status: 'success',
      message: 'Redis connection working',
      details: {
        hasUrl: true,
        hasToken: true,
        testValue,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Redis connection failed',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

