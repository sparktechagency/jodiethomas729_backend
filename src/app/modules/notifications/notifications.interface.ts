import { Types } from 'mongoose';

export interface INotification {
  userId: Types.ObjectId;
  userIdType: 'User' | 'Admin' | 'Employer';
  senderId: Types.ObjectId;
  senderIdType: 'User' | 'Admin' | 'Employer';
  admin?: boolean;
  title: string;
  message: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
