import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const post = await Post.findById(params.id)
      .populate('user', 'firstName lastName username avatar')
      .populate('comments.user', 'firstName lastName username avatar')
      .lean();
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (e) {
    console.error('GET /api/posts/[id] error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 