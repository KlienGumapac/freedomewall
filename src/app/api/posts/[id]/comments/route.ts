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
    const { content, parent } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post: any = await Post.findById(postId);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    post.comments.push({ user: decoded.userId, content, parent: parent || null, createdAt: new Date() });
    await post.save();

    return NextResponse.json({ postId, comments: post.comments });
  } catch (e) {
    console.error('POST /api/posts/[id]/comments error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 