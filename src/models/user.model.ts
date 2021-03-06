import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, unique: true },
  password: { type: String, required: true },
});

export const UserModel = model('User', userSchema);
