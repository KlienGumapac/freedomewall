import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Set it in .env.local');
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const postId = params.id;
    const { type } = await request.json();
    const reactionType = type || 'like';

    const post: any = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const idx = post.reactions.findIndex((r: any) => String(r.user) === String(decoded.userId));
    if (idx >= 0) {
    
      if (post.reactions[idx].type === reactionType) {
        post.reactions.splice(idx, 1);
      } else {
        post.reactions[idx].type = reactionType;
      }
    } else {
      post.reactions.push({ user: decoded.userId, type: reactionType });
    }

    await post.save();
    return NextResponse.json({
      postId,
      reactions: post.reactions,
      likes: post.reactions.length,
      userReacted: post.reactions.some((r: any) => String(r.user) === String(decoded.userId)),
    });
  } catch (e) {
    console.error('POST /api/posts/[id]/reactions error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 