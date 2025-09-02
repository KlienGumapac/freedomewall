'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  followers: number;
  following: number;
  posts: number;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: string;
  isPinned?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Mock posts data for now
      setPosts([
        {
          _id: '1',
          content: 'My greatest love ❤️ Jamby Castro',
          image: '/api/placeholder/400/300',
          likes: 156,
          comments: 23,
          createdAt: '2022-11-02',
          isPinned: true
        },
        {
          _id: '2',
          content: 'Beautiful sunset at the beach today!',
          image: '/api/placeholder/400/300',
          likes: 89,
          comments: 12,
          createdAt: '2022-11-01'
        },
        {
          _id: '3',
          content: 'Working on some exciting new projects!',
          likes: 45,
          comments: 8,
          createdAt: '2022-10-30'
        }
      ]);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            {/* Left Section - Logo and Search */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  <span className="text-green-600">Freedom</span>
                  <span className="text-gray-800">Wall</span>
                </h1>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Freedom Wall"
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {/* Center Section - Navigation Icons */}
            <div className="flex items-center space-x-1">
              <button className="p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center space-x-2">
              {/* Menu Grid */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                </svg>
              </button>
              
              {/* Messenger */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">5</span>
                </div>
              </button>
              
              {/* User Profile */}
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings & Privacy
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between h-16 px-2">
            {/* Mobile Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                <span className="text-green-600">Freedom</span>
                <span className="text-gray-800">Wall</span>
              </h1>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">5</span>
                </div>
              </button>

              {/* User Profile */}
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-xs">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                </button>
                
                {/* Mobile Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings & Privacy
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Banner */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-80 bg-gradient-to-r from-green-400 to-blue-500 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <button className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-100 transition-all">
            Edit cover photo
          </button>
        </div>

        {/* Profile Picture */}
        <div className="absolute bottom-0 left-8 transform translate-y-1/2">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-3xl">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          {/* Left Column - Profile Info */}
          <div className="lg:w-1/3 lg:pr-8 mb-8">
            {/* Name and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mb-4">@{user.username}</p>
              
              <div className="flex space-x-3 mb-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  + Add to story
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Edit profile
                </button>
              </div>

              <div className="text-sm text-gray-600">
                <p>{user.followers || 0} followers</p>
              </div>
            </div>

            {/* Intro Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Intro</h2>
              
              {user.bio ? (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              ) : (
                <p className="text-gray-500 mb-4">No bio added yet</p>
              )}
              
              <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                Edit bio
              </button>

              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  </svg>
                  <span>Studied at SEAIT - South East Asian Institute of Technology</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Lives in Polomolok, South Cotabato</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>In a relationship with Jammy Castro</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Followed by {user.followers || 246} people</span>
                </div>
              </div>

              <button className="text-green-600 hover:text-green-700 text-sm font-medium mt-4">
                Edit details
              </button>
            </div>

            {/* Photos Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ))}
              </div>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium mt-4">
                See all photos
              </button>
            </div>
          </div>

          {/* Right Column - Posts */}
          <div className="lg:w-2/3">
            {/* Profile Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                {['posts', 'about', 'friends', 'photos', 'reels', 'check-ins'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Section */}
            {activeTab === 'posts' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Posts</h2>
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      Filters
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      Manage posts
                    </button>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    List view
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Grid view
                  </button>
                </div>

                {/* Posts Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.map((post) => (
                      <div key={post._id} className="bg-gray-50 rounded-lg overflow-hidden">
                        {post.image && (
                          <div className="aspect-square bg-gray-200 relative">
                            <div className="absolute top-2 left-2">
                              {post.isPinned && (
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                  Pinned
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="p-4">
                          <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span>{post.likes} likes</span>
                            <span>{post.comments} comments</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-semibold text-sm">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </span>
                              {post.isPinned && (
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                  Pinned post
                                </span>
                              )}
                              <span className="text-gray-500 text-sm">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{post.content}</p>
                            {post.image && (
                              <div className="bg-gray-200 rounded-lg h-48 mb-3 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex items-center space-x-6 text-gray-500">
                              <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-sm">{post.likes}</span>
                              </button>
                              <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="text-sm">{post.comments}</span>
                              </button>
                              <button className="flex items-center space-x-2 hover:text-green-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a9 9 0 105.367 5.367l6.632-3.316a9 9 0 00-5.367-5.367l-6.632 3.316a9 9 0 00-5.367 5.367l6.632 3.316z" />
                                </svg>
                                <span className="text-sm">Share</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other Tab Content */}
            {activeTab !== 'posts' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
                </h3>
                <p className="text-gray-500">
                  We're working on bringing you the full {activeTab} experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Search */}
          <button className="flex flex-col items-center p-2 text-gray-600 hover:text-green-600 transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium">Search</span>
          </button>

          {/* Create Post */}
          <button className="flex flex-col items-center p-2 text-gray-600 hover:text-green-600 transition-colors">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-1">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Post</span>
          </button>

          {/* Notifications */}
          <button className="flex flex-col items-center p-2 text-gray-600 hover:text-green-600 transition-colors relative">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute -top-1 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">5</span>
            </div>
            <span className="text-xs font-medium">Alerts</span>
          </button>

          {/* Profile */}
          <button className="flex flex-col items-center p-2 text-green-600">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mb-1">
              <span className="text-green-600 font-semibold text-xs">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Padding to prevent content from being hidden behind bottom nav */}
      <div className="md:hidden h-20"></div>
    </div>
  );
} 