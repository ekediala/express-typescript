/* eslint-disable no-nested-ternary */
import RateLimiter from 'express-rate-limit';
import { config } from 'dotenv';

config();

export const {
  ENVIRONMENT,
  JWT_SECRET_KEY,
  COOKIE_SECRET_KEY,
  MONGO_URL,
  NODE_ENV,
  PORT,
} = process.env;

/**
 * URL for local development
 * @constant
 */
export const LOCAL_URL = 'http://localhost:3000';

/**
 * URL for staging application
 * @constant
 */
export const STAGING_URL = 'https://localhost:3000';

/**
 * URL for production application
 * @constant
 */
export const PRODUCTION_URL = 'https://localhost:3000';

/**
 * URL for demo application.
 * @constant
 */
export const DEMO_URL = 'https://localhost:8080';

/**
 * Application cors origin
 * @constant
 */
export const ORIGIN = ENVIRONMENT === 'production'
  ? PRODUCTION_URL
  : ENVIRONMENT === 'staging'
    ? [STAGING_URL, DEMO_URL, LOCAL_URL]
    : LOCAL_URL;

/**
 * Config options for cors
 * @constant
 */
export const CORS_OPTIONS = {
  origin: ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

/**
 * DDOS attack preventer. App should not allow a user
 * make more than 600 requests every 10 minutes i.e a request per second
 * @constant
 */
export const APP_USE_LIMIT = RateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 600, // limit each IP to 600 requests every 10 minutes, i.e a request per second,
  message: 'Too many requests from this user, please try again after 5 minutes',
});

/**
 * Prevents brute force password hack. Allows 5 login attempts every 10 minutes
 * @constant
 */
export const MAX_LOGIN_LIMITER = RateLimiter({
  windowMs: 5 * 60 * 1000, // 10 minutes
  max: 10, // limit each IP to 10 requests every 10 minutes,
  message: 'Too many login attempts, please try again after 5 minutes.',
});

/**
 * Limit password reset attempts. Allows 5 password reset attemts in an hour
 * @constant
 */
export const MAX_PASSWORD_RESET_LIMITER = RateLimiter({
  windowMs: 60 * 60 * 1000, // 30 minutes
  max: 5, // limit each IP to 5 requests every 30 minutes
  message:
    'Too many password reset attempts, please try again after 30 minutes.',
});

/**
 * URL for version one of API
 * @constant
 */
export const API_VERSION_ONE_URL = '/api/v1';

/**
 * Application name
 * @constant
 */
export const APP_NAME = 'PE-GRID Admin';

/**
 * API routes
 */
export const ROUTES = {
  USER: '/user',
  WILD_CARD: '/*',
  HOME: '/',
};

/**
 * API v1 Test route
 * @constant
 */
export const VERSION_ONE_TEST_ROUTE = '/api/v1';

/**
 * Password encryption salt rounds
 * @const
 */
export const SALT_ROUNDS = 10;
