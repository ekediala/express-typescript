import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { API_KEY } from '../constants/index.constants';
import { errorResponse } from '../helpers/index.helpers';
import { UserModel } from '../models/user.model';
import {
  passwordResetRequestValidator,
  userLoginValidator,
  userRegistrationValidator,
  passwordResetValidator,
} from '../validators/user.validator';

const { UNAUTHORIZED, UNPROCESSABLE_ENTITY, BAD_GATEWAY, CONFLICT } = StatusCodes;

/**
 * Blocks requests from non browser agents except those authorised by us
 */
export function isAllowedDevice(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.get('origin')) {
    return next();
  }

  const authKey = req.header('x-api-key');

  if (authKey && authKey === String(API_KEY)) {
    return next();
  }

  return errorResponse({
    statusCode: UNAUTHORIZED,
    res,
    message: `You are not authorised to use this api.
    Add an 'x-api-key' header to your request and set the value to the API_KEY value in your .env file `,
  });
}

/**
 * Validates the request body when a user tries to request a password reset
 */
export async function validatePasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validValues = await passwordResetRequestValidator.validateAsync(
      req.body
    );
    req.body = validValues;
    return next();
  } catch (error) {
    return errorResponse({
      statusCode: UNPROCESSABLE_ENTITY,
      res,
      message: 'Some fields are missing',
      errors: error.details,
    });
  }
}

export async function validateRegistrationData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validValues = await userRegistrationValidator.validateAsync(req.body);
    req.body = validValues;
    return next();
  } catch (error) {
    return errorResponse({
      statusCode: UNPROCESSABLE_ENTITY,
      res,
      message: 'Some fields are missing',
      errors: error.details,
    });
  }
}

export async function validateLoginData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validValues = await userLoginValidator.validateAsync(req.body);
    req.body = validValues;
    return next();
  } catch (error) {
    return errorResponse({
      statusCode: UNPROCESSABLE_ENTITY,
      res,
      message: 'Some fields are missing',
      errors: error.details,
    });
  }
}

export async function validatePasswordResetData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validValues = await passwordResetValidator.validateAsync(req.body);
    req.body = validValues;
    return next();
  } catch (error) {
    return errorResponse({
      statusCode: UNPROCESSABLE_ENTITY,
      res,
      message: 'Some fields are missing',
      errors: error.details,
    });
  }
}

export async function isUserRegisteredAlready(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const isRegistered = await UserModel.findOne({ email });
    if (isRegistered) {
      return errorResponse({
        statusCode: CONFLICT,
        res,
        message:
          'You are registered already. Please login or reset your password to login',
      });
    }
    return next();
  } catch (error) {
    return errorResponse({
      statusCode: BAD_GATEWAY,
      res,
      message:
        'We encountered a problem while trying to register you. Please try again or contact support.',
    });
  }
}
