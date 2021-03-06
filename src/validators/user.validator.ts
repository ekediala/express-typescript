import { object, string, any, ref } from 'joi';

export const passwordResetRequestValidator = object({
  email: string().email().required(),
});

export const userRegistrationValidator = object({
  email: string().email().required(),
  password: string().min(6).required(),
  confirmPassword: any()
    .equal(ref('password'))
    .required()
    .label('Confirm password')
    .options({ messages: { 'any.only': '{{#label}} does not match password' } }),
});

export const userLoginValidator = object({
  email: string().email().required(),
  password: string().min(6).required(),
});

export const passwordResetValidator = object({
  token: string().required(),
  password: string().min(6).required(),
  confirmPassword: any()
    .equal(ref('password'))
    .required()
    .label('Confirm password')
    .options({ messages: { 'any.only': '{{#label}} does not match password' } }),
});
