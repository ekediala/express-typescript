import mongoose from 'mongoose';
import winston from 'winston';
import debug from 'debug';
import chalk from 'chalk';
import { Request, Response } from 'express';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { sign } from 'jsonwebtoken';

import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import {
  AUTH_HEADER_TOKEN_KEY,
  JWT_AUTH_SECRET_KEY,
  MONGO_TEST_URL,
  MONGO_URL,
  NODE_ENV,
} from '../constants/index.constants';
import { APIErrorResponse, APIOKResponse } from '../utils/types.utils';

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
  const print = debug('express-app');
  print(textColor(data));
}

/**
 * Handle all non defined route visits
 * @param res http response object
 */
export function invalidRoute(_: Request, res: Response) {
  return res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
}

/**
 * Handle api v1 route testing
 * @param res http response object
 */
export function testRoute(_: Request, res: Response) {
  return res.status(StatusCodes.OK).send(ReasonPhrases.OK);
}

/**
 * Connects us to mongodb
 */
export async function connectToDB() {
  try {
    await mongoose.connect(
      NODE_ENV === 'test' ? String(MONGO_TEST_URL) : String(MONGO_URL),
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    );
    log('Successfully connected to database');
  } catch (err) {
    log(err, chalk.red);
  }
}

/**
 * Handles error responses
 * @param param0 the error response
 */
export function errorResponse({
  message,
  errors,
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  res,
}: APIErrorResponse) {
  return res.status(statusCode).json({ message, errors });
}

/**
 * Handles ok responses
 * @param param0 the successful response
 */
export function okResponse({
  message,
  data,
  statusCode = StatusCodes.OK,
  res,
  user,
}: APIOKResponse) {
  if (user) {
    const token = sign(user, String(JWT_AUTH_SECRET_KEY));
    res.set(AUTH_HEADER_TOKEN_KEY, token);
  }
  return res.status(statusCode).json({ message, data });
}

/**
 * Sends an email to a user using nodemailer default test accounts.
 * This can further be extended to use whatever service the user prefers.
 */
export async function sendMail(mailOptions: SendMailOptions) {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    const status = await transporter.sendMail(mailOptions);
    return status;
  } catch (error) {
    throw new Error(error);
  }
}
