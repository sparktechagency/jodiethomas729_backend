import mongoose from 'mongoose';
import { IConversation } from './interface';

const conversationSchema = new mongoose.Schema<IConversation>(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
      },
    ],

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: [],
      },
    ],
  },
  { timestamps: true },
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
