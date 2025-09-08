'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import CreatePost from '@/components/CreatePost';
import PostModal from '@/components/PostModal';

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface Post {
  _id: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  user?: { _id: string; firstName: string; lastName: string; avatar?: string; username: string };
}

async function compressImageToBase64(
  file: File,
  options: { maxWidth: number; quality: number; mimeType?: string }
): Promise<string> {
  const { maxWidth, quality, mimeType } = options;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
  const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  let dataUrl = canvas.toDataURL(mimeType || 'image/jpeg', quality);
  if (mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  return dataUrl;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactionPickerPostId, setReactionPickerPostId] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, 'like'|'love'|'haha'|'wow'|'sad'|'angry'>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  let reactionCloseTimeout: ReturnType<typeof setTimeout> | null = null;

  const reactionEmoji: Record<'like'|'love'|'haha'|'wow'|'sad'|'angry', string> = {
    like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡'
  };

  const openReactionPicker = (postId: string) => {
    if (reactionCloseTimeout) { clearTimeout(reactionCloseTimeout); reactionCloseTimeout = null; }
    setReactionPickerPostId(postId);
  };
  const scheduleCloseReactionPicker = () => {
    if (reactionCloseTimeout) clearTimeout(reactionCloseTimeout);
    reactionCloseTimeout = setTimeout(() => setReactionPickerPostId(null), 200);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        setUser(JSON.parse(userData));
   
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          const items = (data.posts || []) as any[];
          const mapped: Post[] = items.map(p => ({
            _id: p._id,
            content: p.content,
            images: p.images,
            likes: (p.reactions || []).length,
            comments: (p.comments || []).length,
            createdAt: p.createdAt,
            user: p.user ? { _id: p.user._id, firstName: p.user.firstName, lastName: p.user.lastName, avatar: p.user.avatar, username: p.user.username } : undefined,
          }));
          setPosts(mapped);
   
          try {
            const viewerId = JSON.parse(localStorage.getItem('user') as string)?._id;
            if (viewerId) {
              const initial: Record<string, 'like'|'love'|'haha'|'wow'|'sad'|'angry'> = {} as any;
              items.forEach(p => {
                const mine = (p.reactions || []).find((r: any) => String(r.user) === String(viewerId));
                if (mine?.type) initial[p._id] = mine.type;
              });
              setUserReactions(initial);
            }
          } catch {}
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handlePostSubmit = async (content: string, images?: File[]) => {
    try {
      const token = localStorage.getItem('token');
      const toBase64 = async (file: File): Promise<string> => {
        return await compressImageToBase64(file, { maxWidth: 1600, quality: 0.8, mimeType: 'image/webp' });
      };
      const imagePayload: string[] = images && images.length
        ? await Promise.all(images.map(f => toBase64(f)))
        : [];

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, images: imagePayload }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Create post failed', res.status, text);
        return;
      }
      const data = await res.json();
      const created = data.post as any;
      const newPost: Post = {
        _id: created._id,
        content: created.content,
        images: created.images,
        likes: 0,
        comments: 0,
        createdAt: created.createdAt,
      };
      setPosts(prev => [newPost, ...prev]);
    } catch (e) {
      console.error('Create post error:', e);
    }
  };

  const handleToggleLike = async (postId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' = 'like') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setUserReactions(prev => ({ ...prev, [postId]: type }));
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch (e) {
      console.error('Like error', e);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) return;
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: p.comments + 1 } : p));
    } catch (e) {
      console.error('Comment error', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} activePage="home" onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.firstName}! 👋</h2>
          <p className="text-gray-600 text-lg">What's on your mind today?</p>
        </div>

        <CreatePost user={user} onSubmit={handlePostSubmit} />

        <div className="mt-8 space-y-4">
          {posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {post.user ? (
                <Link href={post.user._id === user._id ? '/profile' : `/users/${post.user._id}`} className="flex items-center space-x-3 mb-3 group">
                  <div className="w-10 h-10 bg-green-100 rounded-full overflow-hidden flex items-center justify-center ring-transparent group-hover:ring-2 group-hover:ring-green-500 ring-offset-2">
                    {post.user.avatar ? (
                      <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-green-600 font-semibold text-sm">{post.user.firstName[0]}{post.user.lastName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-green-700">{post.user.firstName} {post.user.lastName}</p>
                    <p className="text-xs text-gray-500">@{post.user.username} • {new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">?</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Unknown User</p>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>

              {Array.isArray(post.images) && post.images.length > 0 && (
                <div className="mb-3">
                  <div className={`grid gap-2 ${post.images.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {post.images.slice(0, 6).map((src, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden">
                        <img src={src} alt={`Post image ${idx + 1}`} className="w-full h-40 object-cover" />
                        {idx === 5 && post.images && post.images.length > 6 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-semibold">+{(post.images.length - 5)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div
                    className="relative"
                    onMouseEnter={() => openReactionPicker(post._id)}
                    onMouseLeave={scheduleCloseReactionPicker}
                  >
                    <button
                      onClick={() => handleToggleLike(post._id, userReactions[post._id] || 'like')}
                      className={`flex items-center space-x-1 font-semibold ${userReactions[post._id] ? 'text-green-700' : 'text-gray-600 hover:text-green-600'}`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${userReactions[post._id] ? 'bg-green-100' : ''}`}>
                        {reactionEmoji[userReactions[post._id] || 'like']}
                      </span>
                      <span>
                        {userReactions[post._id]
                          ? userReactions[post._id].charAt(0).toUpperCase() + userReactions[post._id].slice(1)
                          : 'Like'}
                      </span>
                      <span className={`ml-1 ${userReactions[post._id] ? 'text-green-600' : 'text-gray-400'}`}>{post.likes}</span>
                    </button>
                    {reactionPickerPostId === post._id && (
                      <div
                        className="absolute -top-14 left-0 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-1 flex space-x-1 z-10"
                        onMouseEnter={() => openReactionPicker(post._id)}
                        onMouseLeave={scheduleCloseReactionPicker}
                      >
                        {(['like','love','haha','wow','sad','angry'] as const).map((rt, i) => (
                          <button
                            key={rt}
                            onClick={() => handleToggleLike(post._id, rt)}
                            className={`text-xl transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-125 ${userReactions[post._id]===rt ? 'drop-shadow' : ''}`}
                            style={{ transitionDelay: `${i * 20}ms` }}
                            title={rt}
                          >
                            {reactionEmoji[rt]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setOpenPostId(post._id)} className="text-gray-600 hover:text-green-700 font-medium transition-colors">
                    {post.comments} Comments
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-start space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full overflow-hidden flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="me" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-green-600 text-xs font-semibold">{user.firstName[0]}{user.lastName[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  />
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PostModal postId={openPostId} onClose={() => setOpenPostId(null)} onCommentAdded={(pid) => setPosts(prev => prev.map(p => p._id === pid ? { ...p, comments: p.comments + 1 } : p))} />

      <MobileBottomNav user={user} activePage="home" onCreatePost={() => console.log('Create post clicked')} />
    </div>
  );
} 