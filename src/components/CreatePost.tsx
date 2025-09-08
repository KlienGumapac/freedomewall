'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}

interface CreatePostProps {
  user: User;
  onSubmit: (content: string, images?: File[]) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function CreatePost({ 
  user, 
  onSubmit, 
  placeholder = "What's on your mind?",
  compact = false 
}: CreatePostProps) {
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedImages.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, selectedImages);
      setContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const limited = files.slice(0, 10); 
    setSelectedImages(prev => [...prev, ...limited]);

    limited.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageAt = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Profile picture"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-green-600 font-bold text-sm">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              )}
            </div>
            
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${placeholder}, ${user.firstName}?`}
              className="w-full bg-gray-50 border-0 rounded-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
            />
            
            <button
              type="submit"
              disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
              className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img src={src} alt="Preview" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-75 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <label className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Add Photos</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt="Profile picture"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-green-600 font-bold text-lg">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${placeholder}, ${user.firstName}?`}
              className="w-full border-0 resize-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 text-lg min-h-[120px]"
              rows={4}
            />

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-gray-600 hover:text-green-600 cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Photo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                type="submit"
                disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
