'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';

interface PublicUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  education?: string;
  location?: string;
  relationship?: string;
  joinDate?: string;
}

interface Post {
  _id: string;
  content: string;
  images?: string[];
  createdAt: string;
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [viewer, setViewer] = useState<any>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const viewerData = localStorage.getItem('user');
    if (!token || !viewerData) {
      router.push('/login');
      return;
    }
    setViewer(JSON.parse(viewerData));

    const load = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setUser(data.user);

        const postsRes = await fetch(`/api/posts?userId=${encodeURIComponent(id)}`);
        if (postsRes.ok) {
          const pdata = await postsRes.json();
          const items = (pdata.posts || []) as any[];
          setPosts(items.map(p => ({ _id: p._id, content: p.content, images: p.images, createdAt: p.createdAt })));
        } else {
          setPosts([]);
        }
      } catch (e) {
        console.error('Load public profile error', e);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, router]);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={viewer} activePage="profile" onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); }} />

      <div className="relative">
        <div className="h-80 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
          {user.coverPhoto ? (
            <Image src={user.coverPhoto} alt="Cover" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          )}
        </div>

        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            {user.avatar ? (
              <Image src={user.avatar} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" />
            ) : (
              <span className="text-green-600 font-bold text-3xl">{user.firstName[0]}{user.lastName[0]}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          {user.bio && <p className="text-gray-700">{user.bio}</p>}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts</h2>
          <div className="space-y-4">
            {posts.map(p => (
              <div key={p._id} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{p.content}</p>
                {Array.isArray(p.images) && p.images.length > 0 && (
                  <div className="grid gap-2 grid-cols-3">
                    {p.images.slice(0, 6).map((src, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden">
                        <img src={src} alt="post" className="w-full h-40 object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-gray-500">No posts yet.</p>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav user={viewer} activePage="profile" />
    </div>
  );
} 