import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { PostCard } from '../components/community/PostCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Users,
  MessageSquare,
  BookOpen,
  Plus,
  Search,
  TrendingUp,
  Clock
} from 'lucide-react';
import { studyGroups } from '../data/mockPosts';

export default function Community() {
  const { posts, user, currentLanguage, addPost } = useStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'qa'>('feed');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const filteredPosts = posts.filter((post) => post.language === currentLanguage);

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !user) return;

    addPost({
      authorId: user.id,
      authorName: user.nickname,
      authorAvatar: user.avatar,
      content: newPostContent,
      language: currentLanguage,
      tags: [currentLanguage.toUpperCase()]
    });

    setNewPostContent('');
    setShowNewPost(false);
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-24 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">社区</h1>
          <p className="text-slate-400">
            与学习伙伴交流，分享学习心得
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex gap-2 flex-1">
                {[
                  { id: 'feed', label: '动态', icon: TrendingUp },
                  { id: 'groups', label: '小组', icon: Users },
                  { id: 'qa', label: '问答', icon: MessageSquare }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {user && activeTab === 'feed' && (
                <Button size="sm" onClick={() => setShowNewPost(true)}>
                  <Plus size={16} className="mr-1" />
                  发帖
                </Button>
              )}
            </motion.div>

            {activeTab === 'feed' && (
              <>
                {showNewPost && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                  >
                    <Card className="p-4">
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="分享你的学习心得..."
                        className="w-full bg-transparent text-white placeholder-slate-400 resize-none focus:outline-none min-h-[100px]"
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewPost(false)}
                        >
                          取消
                        </Button>
                        <Button size="sm" onClick={handleCreatePost}>
                          发布
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {filteredPosts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}

                  {filteredPosts.length === 0 && (
                    <Card className="text-center py-12">
                      <p className="text-slate-400">暂无动态，快来发布第一条吧！</p>
                    </Card>
                  )}
                </div>
              </>
            )}

            {activeTab === 'groups' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hover>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-white mb-1">{group.name}</h3>
                          <p className="text-sm text-slate-400">{group.description}</p>
                        </div>
                        <Badge variant="info">{group.language.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          {group.members.toLocaleString()} 成员
                        </span>
                        <Button variant="secondary" size="sm">
                          加入
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'qa' && (
              <Card className="text-center py-12">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">问答功能即将上线，敬请期待！</p>
              </Card>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <h3 className="font-bold text-white mb-4">热门话题</h3>
              <div className="space-y-3">
                {['#学习方法', '#英语口语', '#日语N1', '#韩语追星'].map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between text-sm cursor-pointer hover:text-violet-400 transition-colors"
                  >
                    <span className="text-slate-300">{topic}</span>
                    <span className="text-slate-500">1.2k 浏览</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-white mb-4">学习达人</h3>
              <div className="space-y-4">
                {[
                  { name: '语言大师', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master', streak: 365 },
                  { name: '词汇女王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Queen', streak: 200 },
                  { name: '口语达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Speaker', streak: 150 }
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">连续学习 {user.streak} 天</p>
                    </div>
                    <span className="text-orange-400">🔥</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
