import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import {
  API_VERSION_ONE_URL,
  APP_USE_LIMIT,
  COOKIE_SECRET_KEY,
  CORS_OPTIONS,
  ROUTES,
  PORT,
  NODE_ENV,
} from './constants/index.constants';

import { invalidRoute, log, connectToDB } from './helpers/index.helpers';
import versionOneRouter from './router/index.router';

const app = express();

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.use(APP_USE_LIMIT);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser(COOKIE_SECRET_KEY));

// handle every valid request i.e request to api/v1
app.use(API_VERSION_ONE_URL, versionOneRouter);

// reject all unknown routes (routes not directed to api/v1)
app.all(ROUTES.WILD_CARD, invalidRoute);

connectToDB();

if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    log(`App running on port ${process.env.PORT}`);
  });
}

export default app;
