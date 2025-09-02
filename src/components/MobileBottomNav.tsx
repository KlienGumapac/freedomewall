'use client';

import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface MobileBottomNavProps {
  user: User;
  activePage?: 'home' | 'search' | 'create' | 'notifications' | 'profile';
  onCreatePost?: () => void;
}

export default function MobileBottomNav({ user, activePage = 'home', onCreatePost }: MobileBottomNavProps) {
  const router = useRouter();

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={() => router.push('/dashboard')}
            className={`flex flex-col items-center p-2 transition-colors ${
              activePage === 'home' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill={activePage === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button 
            className={`flex flex-col items-center p-2 transition-colors ${
              activePage === 'search' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium">Search</span>
          </button>

          <button 
            onClick={onCreatePost}
            className={`flex flex-col items-center p-2 transition-colors ${
              activePage === 'create' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-1 hover:bg-green-700 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium">Post</span>
          </button>

          <button 
            className={`flex flex-col items-center p-2 transition-colors relative ${
              activePage === 'notifications' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute -top-1 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">5</span>
            </div>
            <span className="text-xs font-medium">Alerts</span>
          </button>

          <button 
            onClick={() => router.push('/profile')}
            className={`flex flex-col items-center p-2 transition-colors ${
              activePage === 'profile' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
              activePage === 'profile' ? 'bg-green-600' : 'bg-green-100'
            }`}>
              <span className={`font-semibold text-xs ${
                activePage === 'profile' ? 'text-white' : 'text-green-600'
              }`}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      <div className="md:hidden h-20"></div>
    </>
  );
} 