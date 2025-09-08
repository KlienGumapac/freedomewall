import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await User.findById(params.id)
      .select('firstName lastName username avatar coverPhoto bio education location relationship joinDate followers following createdAt')
      .lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (e) {
    console.error('GET /api/users/[id] error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 