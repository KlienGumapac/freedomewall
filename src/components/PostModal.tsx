'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PostModalProps {
  postId: string | null;
  onClose: () => void;
  onCommentAdded?: (postId: string) => void;
}

export default function PostModal({ postId, onClose, onCommentAdded }: PostModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (postId) {
      setIsOpen(true);
      fetch(`/api/posts/${postId}`)
        .then(r => r.json())
        .then(data => setPost(data.post))
        .catch(() => setPost(null));
    } else {
      setIsOpen(false);
      setPost(null);
    }
    return () => { if (closeTimeout.current) clearTimeout(closeTimeout.current); };
  }, [postId]);

  const handleClose = () => {
    setIsOpen(false);
    closeTimeout.current = setTimeout(onClose, 150);
  };

  const handleAddComment = async () => {
    if (!postId || !comment.trim()) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: comment }),
    });
    if (res.ok) {
      const me = JSON.parse(localStorage.getItem('user') as string);
      setPost((prev: any) => ({
        ...prev,
        comments: [...prev.comments, { user: me, content: comment, createdAt: new Date().toISOString() }],
      }));
      setComment('');
      if (onCommentAdded) onCommentAdded(postId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && post && (
        <motion.div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-green-600 font-semibold text-sm">{post.user?.firstName?.[0]}{post.user?.lastName?.[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.user ? `${post.user.firstName} ${post.user.lastName}` : 'User'}</p>
                  <p className="text-xs text-gray-500">@{post.user?.username} • {new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

              {Array.isArray(post.images) && post.images.length > 0 && (
                <div className={`grid gap-2 ${post.images.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {post.images.map((src: string, idx: number) => (
                    <div key={idx} className="rounded-lg overflow-hidden">
                      <img src={src} alt={`image ${idx + 1}`} className="w-full h-64 object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 pt-0 flex flex-col max-h-[50vh]">
                <div className="px-4 pt-4">
                  <h3 className="text-sm font-semibold text-gray-700">Comments</h3>
                </div>
                <div className="space-y-3 px-4 pb-20 overflow-y-auto max-h-[45vh]">
                  {post.comments?.map((c: any, i: number) => (
                    <div key={i} className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {c.user?.avatar ? (
                          <img src={c.user.avatar} alt="c" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-green-600 text-xs font-semibold">{c.user?.firstName?.[0]}{c.user?.lastName?.[0]}</span>
                        )}
                      </div>
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">{c.user ? `${c.user.firstName} ${c.user.lastName}` : 'Unknown'}</p>
                        <p className="text-sm text-gray-800">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <div className="flex items-start space-x-2">
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                    />
                    <button onClick={handleAddComment} className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Send</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 