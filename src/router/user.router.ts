import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import {
  validatePasswordResetRequest,
  validatePasswordResetData,
  validateLoginData,
  validateRegistrationData,
  isUserRegisteredAlready
} from '../middleware/user.middleware';
import { ROUTES } from './routes';

const {
  REQUEST_PASSWORD_RESET,
  REGISTER,
  LOGIN,
  RESET_PASSWORD,
  VERIFY_PASSWORD_RESET_REQUEST,
} = ROUTES;

const {
  requestPasswordReset,
  register,
  resetPassword,
  verifyPasswordResetRequest,
  login,
} = UserController;

const userRouter = Router();

userRouter.post(
  REQUEST_PASSWORD_RESET,
  validatePasswordResetRequest,
  requestPasswordReset
);

userRouter.post(REGISTER, validateRegistrationData, isUserRegisteredAlready, register);

userRouter.post(LOGIN, validateLoginData, login);

userRouter.post(RESET_PASSWORD, validatePasswordResetData, resetPassword);

userRouter.get(VERIFY_PASSWORD_RESET_REQUEST, verifyPasswordResetRequest);

export { userRouter };
