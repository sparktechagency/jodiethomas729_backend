import mongoose, { Model, Schema } from 'mongoose';
import { INotification } from './notifications.interface';

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'userIdType',
    },
    userIdType: {
      type: String,
      enum: ["User", "Admin", "Employer"],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'senderIdType',
    },
    senderIdType: {
      type: String,
      enum: ["User", "Admin", "Employer"],
      required: true,
    },
    admin: {
      type: Boolean,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Notification: Model<INotification> = mongoose.model(
  'Notification',
  notificationSchema,
);

export default Notification;
