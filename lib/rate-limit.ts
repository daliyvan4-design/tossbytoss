import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// 5 checkouts per IP per 10 minutes
export const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rl:checkout",
});

// 3 newsletter signups per IP per hour
export const newsletterLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:newsletter",
});

// 20 admin API calls per IP per minute
export const adminLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  prefix: "rl:admin",
});
