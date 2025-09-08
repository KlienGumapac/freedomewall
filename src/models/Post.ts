import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReaction {
  user: Types.ObjectId;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface IComment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parent?: Types.ObjectId | null;
  createdAt: Date;
}

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  images: string[]; 
  reactions: IReaction[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], required: true },
}, { _id: false });

const CommentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Post.comments', default: null },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<IPost>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true, default: '' },
  images: { type: [String], default: [] },
  reactions: { type: [ReactionSchema], default: [] },
  comments: { type: [CommentSchema], default: [] },
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production' && (mongoose.models as any).Post) {
  delete (mongoose.models as any).Post;
}

export default mongoose.model<IPost>('Post', PostSchema); 