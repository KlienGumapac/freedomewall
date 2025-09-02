'use client';

import { useState } from 'react';
import Image from 'next/image';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares?: number;
  createdAt: string;
  isPinned?: boolean;
  isLiked?: boolean;
  author: User;
}

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function PostCard({ 
  post, 
  currentUser,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  showActions = true,
  compact = false
}: PostCardProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike?.(post._id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const isOwnPost = currentUser?._id === post.author._id;

  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
        {post.image && (
          <div className="aspect-square bg-gray-200 relative">
            {post.isPinned && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  Pinned
                </span>
              </div>
            )}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        <div className="p-4">
          <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>{likesCount} likes</span>
            <span>{post.comments} comments</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-semibold text-sm">
                {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {post.author.firstName} {post.author.lastName}
                </h3>
                {post.isPinned && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    Pinned post
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  {isOwnPost ? (
                    <>
                      <button
                        onClick={() => {
                          onEdit?.(post._id);
                          setShowOptionsMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit post
                      </button>
                      <button
                        onClick={() => {
                          onDelete?.(post._id);
                          setShowOptionsMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete post
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Hide post
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Report post
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>
      {post.image && (
        <div className="relative">
          <div className="bg-gray-200 aspect-video flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      {showActions && (likesCount > 0 || post.comments > 0 || (post.shares && post.shares > 0)) && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {likesCount > 0 && (
                <span className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <span>{likesCount}</span>
                </span>
              )}
              {post.comments > 0 && (
                <span>{post.comments} comments</span>
              )}
            </div>
            {post.shares && post.shares > 0 && (
              <span>{post.shares} shares</span>
            )}
          </div>
        </div>
      )}

      {showActions && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">Like</span>
            </button>

            <button
              onClick={() => onComment?.(post._id)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">Comment</span>
            </button>

            <button
              onClick={() => onShare?.(post._id)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a9 9 0 105.367 5.367l6.632-3.316a9 9 0 00-5.367-5.367l-6.632 3.316a9 9 0 00-5.367 5.367l6.632 3.316z" />
              </svg>
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 