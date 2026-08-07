import { Document as MongooseDocument, Types } from 'mongoose';

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface INotification extends MongooseDocument {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  unread: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
