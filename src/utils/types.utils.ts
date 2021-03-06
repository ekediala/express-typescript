import { Response } from 'express';

export interface APIResponse {
  res: Response;
  message: string;
  statusCode?: number;
}

export interface APIErrorResponse extends APIResponse {
  errors?: any;
}

export interface User {
  _id: string;
}

export interface APIOKResponse extends APIResponse {
  data?: any;
  user?: User;
}
