import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Set it in .env.local');
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query: any = {};
    if (userId) query.user = userId;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName avatar username')
      .lean();

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('GET /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { content, images } = await request.json();

    if (!content && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'Content or images required' }, { status: 400 });
    }

    const newPost = await Post.create({
      user: decoded.userId,
      content: content || '',
      images: Array.isArray(images) ? images : [],
      reactions: [],
      comments: [],
    });

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 