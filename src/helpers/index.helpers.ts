import mongoose from 'mongoose';
import winston from 'winston';
import debug from 'debug';
import chalk from 'chalk';

import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import { MONGO_URL } from '../constants/index.constants';

const myformat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

/**
 * Winston logger
 */
export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: 500,
    }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: myformat,
    }),
  ],
});

/**
 * Logs message to the console in dev mode
 * @param data the data to be logged
 * @param textColor color of console
 */
export function log(data: any, textColor = chalk.bold.magentaBright) {
  const print = debug('pe-grid-admin');
  print(textColor(data));
}

/**
 * Handle all non defined route visits
 * @param res http response object
 */
export function invalidRoute(_: any, res: any) {
  return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
}

/**
 * Handle api v1 route testing
 * @param res http response object
 */
export function testRoute(_: any, res: any) {
  return res.status(StatusCodes.OK).send(ReasonPhrases.OK);
}

/**
 * Connects us to mongodb
 */
export async function connectToDB() {
  try {
    await mongoose.connect(MONGO_URL || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true,
    });
    log('Successfully connected to database');
  } catch (err) {
    log(err, chalk.red);
  }
}
