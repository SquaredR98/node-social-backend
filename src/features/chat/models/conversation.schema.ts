import mongoose, { Model, Schema, model } from 'mongoose';
import { IConversationDocument } from '../interfaces/conversation.interface';

const conversationSchema: Schema = new Schema({
  senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Types.ObjectId, ref: 'User' }
});

const ConversationModel: Model<IConversationDocument> =
  model<IConversationDocument>(
    'Conversation',
    conversationSchema,
    'Conversation'
  );


export { ConversationModel }