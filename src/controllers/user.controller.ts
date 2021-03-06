/* eslint-disable no-underscore-dangle */
import { Request, Response } from 'express';
import { errorResponse, okResponse, sendMail } from '../helpers/index.helpers';
import { UserModel } from '../models/user.model';
import { StatusCodes } from 'http-status-codes';
import {
  MAIL_SENDER,
  JWT_PASSWORD_RESET_REQUEST_SECRET_KEY,
  APP_NAME,
  SALT_ROUNDS,
  JWT_PASSWORD_RESET_SECRET_KEY,
  NODE_ENV,
} from '../constants/index.constants';
import { sign, verify } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { NOT_FOUND, BAD_GATEWAY, CREATED, UNPROCESSABLE_ENTITY } = StatusCodes;

export class UserController {
  static async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;
    try {
      const user = await UserModel.findOne({ email }).exec();
      if (!user) {
        return errorResponse({
          res,
          message: 'Sorry, we could not find a user with that email.',
          statusCode: NOT_FOUND,
        });
      }

      const token = sign(
        { email },
        String(JWT_PASSWORD_RESET_REQUEST_SECRET_KEY),
        {
          expiresIn: '11m',
        }
      );

      const passwordResetLink = `${req.get('origin')}/reset-password/${token}`;

      const html = `<div style="display: flex; justify-content: center; align-items: center
        flex-direction: column">
        <p>Please click the button below to reset your password</p>
        <a style="display: block; border: none; padding: 5px; border-radius: 10px color: white;
        background: crimson; margin: 10px 0; width: 200px; text-decoration: none; outline: none"
        href='${passwordResetLink}'>Reset Password</a>
        <p><a href='${passwordResetLink}'>Link</a> expires in 10 minutes</p>
        <p>Please copy the link and paste in a browser if clicking the button does not work.</p>
        <p>If you did not initiate this request, please ignore this message</p>
      </div>
      <p>Regards,</p>
      <p>${APP_NAME}</p>
      `;

      if (NODE_ENV !== 'test') {
        await sendMail({
          from: MAIL_SENDER,
          to: email,
          html,
          subject: 'Password Reset',
        });
      }

      return okResponse({
        res,
        message: `Password reset token sent to ${email}`,
      });
    } catch (error) {
      return errorResponse({
        res,
        message:
          'Sorry, we ran into trouble trying to send the reset token. Please try again or contact support.',
        statusCode: BAD_GATEWAY,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user: any = await UserModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          message: 'We could not find a user with those details.',
          statusCode: NOT_FOUND,
        });
      }

      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) {
        return errorResponse({
          res,
          message: 'Invalid credentials.',
          statusCode: UNPROCESSABLE_ENTITY,
        });
      }

      const { password: _, ...rest } = user._doc;

      return okResponse({
        res,
        message: 'Success',
        data: rest,
        user: rest
      });
    } catch (error) {
      return errorResponse({
        res,
        message:
          'Sorry, we ran into trouble trying to log you in. Please try again or contact support.',
        statusCode: BAD_GATEWAY,
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { password, confirmPassword: _, ...rest } = req.body;

      const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

      const user = await UserModel.create({
        ...rest,
        password: hashedPassword,
      });
      await user.save();
      return okResponse({
        res,
        message: 'Success',
        data: rest,
        statusCode: CREATED,
        user: rest
      });
    } catch (error) {
      return errorResponse({
        res,
        message:
          'Sorry, we ran into trouble trying to register you. Please try again or contact support.',
        statusCode: BAD_GATEWAY,
      });
    }
  }

  static async verifyPasswordResetRequest(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const data = verify(token, String(JWT_PASSWORD_RESET_REQUEST_SECRET_KEY));
      const newToken = sign(data, String(JWT_PASSWORD_RESET_SECRET_KEY), {
        expiresIn: '10m',
      });
      return okResponse({
        res,
        message: 'Success',
        data: { token: newToken },
      });
    } catch (error) {
      return errorResponse({
        res,
        message: 'Link expired. Please request another password reset.',
        statusCode: NOT_FOUND,
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      const { email }: any = verify(
        token,
        String(JWT_PASSWORD_RESET_SECRET_KEY)
      );
      const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
      await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });
      const user: any = await UserModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          message: 'Sorry, we could not find a user with that email.',
          statusCode: NOT_FOUND,
        });
      }
      await user.update({ password: hashedPassword }).exec();
      const { password: _, ...rest } = user._doc;
      return okResponse({
        res,
        message: 'Successfully changed password',
        data: rest,
        user: rest
      });
    } catch (error) {
      return errorResponse({
        res,
        message: 'Link expired. Please request another password reset.',
        statusCode: NOT_FOUND,
      });
    }
  }
}
