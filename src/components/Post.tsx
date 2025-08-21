import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CommentForm } from './CommentForm';

export interface PostData {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  createdAt: any;
  likes: string[];
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: any;
  }>;
}

interface PostProps {
  post: PostData;
}

export const Post: React.FC<PostProps> = ({ post }) => {
  const { currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false;
  const canComment = post.comments.length < 2;

  const handleLike = async () => {
    if (!currentUser || loading) return;

    setLoading(true);
    const postRef = doc(db, 'posts', post.id);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }

    setLoading(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Firestore Timestamps have a toDate() method, JS Dates do not.
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(post.authorName)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{post.authorName}</h3>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <p className="mt-3 text-gray-900 whitespace-pre-wrap">{post.content}</p>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                disabled={loading}
                className={`flex items-center space-x-2 transition-all ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart 
                  className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
                />
                <span className="text-sm font-medium">{post.likes.length}</span>
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pl-13 border-t border-gray-100 pt-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{comment.authorName}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-900">{comment.content}</p>
            </div>
          ))}
          
          {canComment && currentUser && (
            <CommentForm postId={post.id} />
          )}
          
          {!canComment && (
            <p className="text-sm text-gray-500 italic mt-2">
              Maximum number of comments reached (2)
            </p>
          )}
        </div>
      )}
    </div>
  );
};