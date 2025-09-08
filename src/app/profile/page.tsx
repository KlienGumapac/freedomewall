'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import ImageUploadModal from '@/components/ImageUploadModal';
import ProfileInfoModal, { ProfileData } from '@/components/ProfileInfoModal';
import CreatePost from '@/components/CreatePost';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  education?: string;
  location?: string;
  relationship?: string;
  joinDate?: string;
  followers: number;
  following: number;
  posts: number;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  images?: string[]; 
  userId?: string;
  likes: number;
  comments: number;
  createdAt: string;
  isPinned?: boolean;
}

const reactionEmoji: Record<'like'|'love'|'haha'|'wow'|'sad'|'angry', string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

function formatJoinDate(input?: string): string | undefined {
  if (!input) return undefined;
  const date = new Date(input);
  if (isNaN(date.getTime())) return input;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'friends'>('posts');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showProfileInfoModal, setShowProfileInfoModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [reactionPickerPostId, setReactionPickerPostId] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, 'like'|'love'|'haha'|'wow'|'sad'|'angry'>>({});
  const reactionCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openReactionPicker = (postId: string) => {
    if (reactionCloseTimeout.current) {
      clearTimeout(reactionCloseTimeout.current);
      reactionCloseTimeout.current = null;
    }
    setReactionPickerPostId(postId);
  };

  const scheduleCloseReactionPicker = () => {
    if (reactionCloseTimeout.current) clearTimeout(reactionCloseTimeout.current);
    reactionCloseTimeout.current = setTimeout(() => setReactionPickerPostId(null), 200);
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
        const res = await fetch('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const fetched: User = data.user;
          fetched.joinDate = formatJoinDate(fetched.joinDate) || fetched.joinDate;
          setUser(fetched);
          localStorage.setItem('user', JSON.stringify(fetched));
        } else {
          const parsedUser: User = JSON.parse(userData);
          parsedUser.joinDate = formatJoinDate(parsedUser.joinDate) || parsedUser.joinDate;
          setUser(parsedUser);
        }

        const userId = JSON.parse(localStorage.getItem('user') as string)?._id;
        if (userId) {
          const postsRes = await fetch(`/api/posts?userId=${encodeURIComponent(userId)}`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            const items = (postsData.posts || []) as any[];
            const mapped: Post[] = items.map(p => ({
              _id: p._id,
              content: p.content,
              images: p.images,
              userId: typeof p.user === 'object' ? p.user._id : p.user,
              likes: (p.reactions || []).length,
              comments: (p.comments || []).length,
              createdAt: p.createdAt,
            }));
            setPosts(mapped);

            try {
              const viewerId = JSON.parse(localStorage.getItem('user') as string)?._id;
              if (viewerId) {
                const initialReactions: Record<string, 'like'|'love'|'haha'|'wow'|'sad'|'angry'> = {} as any;
                items.forEach(p => {
                  const mine = (p.reactions || []).find((r: any) => String(r.user) === String(viewerId));
                  if (mine && mine.type) initialReactions[p._id] = mine.type;
                });
                setUserReactions(initialReactions);
              }
            } catch {}
          } else {
            setPosts([]);
          }
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('Error loading user:', error);
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

    router.push('/login');
  };

  const handleProfileInfoSave = async (profileData: ProfileData) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bio: profileData.bio,
            education: profileData.education,
            location: profileData.location,
            relationship: profileData.relationship,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const updated: User = data.user;
          updated.joinDate = formatJoinDate(updated.joinDate) || updated.joinDate;
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        } else {
          console.error('Failed to update profile');
          alert('Failed to update profile. Please try again.');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      }
    }
  };

  const handleProfileImageUpload = async (file: File) => {
    if (user) {
      try {
        
        const imageUrl = await compressImageToBase64(file, { maxWidth: 256, quality: 0.8, mimeType: 'image/jpeg' });
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/avatar', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: imageUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          const updated: User = data.user;
          updated.joinDate = formatJoinDate(updated.joinDate) || updated.joinDate;
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        } else {
          console.error('Failed to update avatar');
          alert('Failed to update profile picture. Please try again.');
        }
      } catch (error) {
        console.error('Error updating avatar:', error);
        alert('Error updating profile picture. Please try again.');
      }
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    if (user) {
      try {
  
        const imageUrl = await compressImageToBase64(file, { maxWidth: 1280, quality: 0.75, mimeType: 'image/webp' });
        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/cover-photo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ coverPhoto: imageUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          const updated: User = data.user;
          updated.joinDate = formatJoinDate(updated.joinDate) || updated.joinDate;
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        } else {
          const text = await response.text().catch(() => '');
          console.error('Failed to update cover photo', response.status, text);
          alert('Failed to update cover photo. Please try again (image may be too large).');
        }
      } catch (error) {
        console.error('Error updating cover photo:', error);
        alert('Error updating cover photo. Please try again.');
      }
    }
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, images: imagePayload }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Create post failed', res.status, text);
        alert('Failed to create post. Please try again.');
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
      alert('Failed to create post.');
    }
  };

  const handleToggleLike = async (postId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' = 'like') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} activePage="profile" onLogout={handleLogout} />

      <div className="relative">
        {/* Cover Photo */}
        <div className="h-80 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
          {user.coverPhoto ? (
            <Image
              src={user.coverPhoto}
              alt="Cover photo"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          )}
          <button 
            onClick={() => setShowCoverModal(true)}
            className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-100 transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Edit cover photo</span>
          </button>
        </div>

        {/* Profile Picture */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-3xl">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="lg:w-1/3 lg:pr-8 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              
              <div className="flex space-x-3 mb-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  + Add to story
                </button>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">{user.followers || 0}</span> followers</p>
                <p><span className="font-medium">{user.following || 0}</span> friends</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Intro</h2>
              
              {user.bio ? (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              ) : (
                <p className="text-gray-500 mb-4">No details added yet</p>
              )}
              
              <button 
                onClick={() => setShowProfileInfoModal(true)}
                className="text-green-600 hover:text-green-700 text-sm font-medium hover:bg-green-50 px-3 py-1 rounded transition-colors"
              >
                {user.bio || user.education || user.location || user.relationship ? 'Edit details' : 'Add details'}
              </button>

              {(user.education || user.location || user.relationship || user.joinDate) && (
                <div className="mt-4 space-y-3">
                  {user.education && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      </svg>
                      <span>Studied at {user.education}</span>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Lives in {user.location}</span>
                    </div>
                  )}

                  {user.relationship && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{user.relationship}</span>
                    </div>
                  )}

                  {user.joinDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Joined {user.joinDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {posts.filter(post => post.image).slice(0, 6).map((post) => (
                  <div key={post._id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={post.image!}
                      alt="Post"
                      width={100}
                      height={100}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
                {posts.filter(post => post.image).length < 6 && (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">+</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`pb-2 border-b-2 font-medium transition-colors ${
                        activeTab === 'posts'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Posts
                    </button>
                    <button
                      onClick={() => setActiveTab('about')}
                      className={`pb-2 border-b-2 font-medium transition-colors ${
                        activeTab === 'about'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      About
                    </button>
                    <button
                      onClick={() => setActiveTab('friends')}
                      className={`pb-2 border-b-2 font-medium transition-colors ${
                        activeTab === 'friends'
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Friends
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {viewMode === 'list' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {activeTab === 'posts' && (
                  <div className="space-y-6">
                    {/* Create Post Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <CreatePost user={user} onSubmit={handlePostSubmit} />
                    </div>
                    
                    {/* Posts List */}
                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
                      {posts.map((post) => (
                      <div key={post._id} className={`bg-gray-50 rounded-lg p-4 ${post.isPinned ? 'border-l-4 border-green-600' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt="Profile"
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-green-600 font-medium text-sm">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {post.isPinned && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Pinned</span>
                          )}
                        </div>
                        
                        <p className="text-gray-800 mb-3">{post.content}</p>
                        
                        {Array.isArray(post.images) && post.images.length > 0 ? (
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
                        ) : post.image ? (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <Image
                              src={post.image}
                              alt="Post"
                              width={400}
                              height={300}
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        ) : null}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div
                              className="relative"
                              onMouseEnter={() => openReactionPicker(post._id)}
                              onMouseLeave={scheduleCloseReactionPicker}
                            >
                              <button
                                onClick={() => handleToggleLike(post._id, userReactions[post._id] || 'like')}
                                className="hover:text-green-600 font-medium flex items-center space-x-1"
                              >
                                <span>{reactionEmoji[userReactions[post._id] || 'like']}</span>
                                <span>Like</span>
                                <span className="ml-1 text-gray-400">{post.likes}</span>
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
                            <span>{post.comments} Comments</span>
                          </div>
                          <button className="text-green-600 hover:text-green-700 font-medium">
                            Share
                          </button>
                        </div>

                        <div className="mt-3 flex items-start space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full overflow-hidden flex items-center justify-center">
                            {user.avatar ? (
                              <Image src={user.avatar} alt="Me" width={32} height={32} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-green-600 text-xs font-semibold">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
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
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-700">
                        Software developer passionate about building innovative web applications. 
                        Currently working on Freedom Wall, a social media platform that promotes 
                        freedom of expression and community building.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Work</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          <span>Full Stack Developer at Freedom Wall</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'friends' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Friends</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((friend) => (
                        <div key={friend} className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                          <p className="text-sm font-medium text-gray-900">Friend {friend}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav user={user} activePage="profile" />

      {/* Image Upload Modals */}
      <ImageUploadModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpload={handleProfileImageUpload}
        type="profile"
        currentImage={user.avatar}
        title="Update Profile Picture"
      />

      <ImageUploadModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        onUpload={handleCoverImageUpload}
        type="cover"
        currentImage={user.coverPhoto}
        title="Update Cover Photo"
      />

      {/* Profile Info Modal */}
      <ProfileInfoModal
        isOpen={showProfileInfoModal}
        onClose={() => setShowProfileInfoModal(false)}
        onSave={handleProfileInfoSave}
        currentData={{
          bio: user.bio || '',
          education: user.education || '',
          location: user.location || '',
          relationship: user.relationship || '',
          joinDate: user.joinDate || (() => {
            const now = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"];
            return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
          })()
        }}
      />
    </div>
  );
}

