import { useState } from 'react';
import { motion } from 'framer-motion';
import { Post } from '../../types';
import { useStore } from '../../stores/useStore';
import { Heart, MessageCircle, Share2, Bookmark, Globe } from 'lucide-react';
import { Badge } from '../common/Badge';

interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const { toggleLikePost, user } = useStore();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    toggleLikePost(post.id);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    useStore.getState().addComment(post.id, {
      authorId: user.id,
      authorName: user.nickname,
      authorAvatar: user.avatar,
      content: newComment
    });
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={post.authorAvatar}
          alt={post.authorName}
          className="w-12 h-12 rounded-full border-2 border-violet-500/30"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white">{post.authorName}</h4>
            <span className="text-slate-500">·</span>
            <span className="text-sm text-slate-500">{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Globe size={12} className="text-slate-500" />
            <Badge variant="info" size="sm">
              {post.language.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {post.images && post.images.length > 0 && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={post.images[0]}
            alt="post"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs bg-violet-500/10 text-violet-400 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-slate-700/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            post.liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
          }`}
        >
          <motion.div
            animate={{ scale: post.liked ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              size={18}
              className={post.liked ? 'fill-red-400' : ''}
            />
          </motion.div>
          <span className="text-sm">{post.likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm">{post.comments.length}</span>
        </button>

        <button className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors">
          <Share2 size={18} />
          <span className="text-sm">分享</span>
        </button>

        <button className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors ml-auto">
          <Bookmark size={18} />
        </button>
      </div>

      {showComments && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-4 pt-4 border-t border-slate-700/50"
        >
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 mb-4">
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{comment.authorName}</span>
                  <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))}

          {user && (
            <div className="flex gap-3">
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="写下你的评论..."
                  className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-violet-600 text-white text-sm rounded-xl hover:bg-violet-500 transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.article>
  );
}
