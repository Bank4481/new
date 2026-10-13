import React, { useState } from 'react';
import {
  Search,
  Home,
  Tv,
  Users,
  ClipboardList,
  Trophy,
  Plus,
  MessageCircle,
  Bell,
  ThumbsUp,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Globe,
  Sparkles,
  BookOpen,
  CheckCircle,
  Send,
  Smile,
  ImageIcon,
  Compass,
  Award,
  Clock,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  ExternalLink,
  Flame,
  UserCheck,
} from 'lucide-react';
import type { Course, SiteSettings, Discussion, Reply } from '../types';
import { useAuth } from '../context/AuthContext';
import { StoryViewerModal, StoryItem } from '../components/facebook/StoryViewerModal';
import { CreatePostModal } from '../components/facebook/CreatePostModal';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

interface HomeViewProps {
  courses: Course[];
  settings: SiteSettings | null;
  discussions?: Discussion[];
  replies?: Reply[];
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenMessengerWithContact?: (name: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  settings,
  discussions = [],
  replies = [],
  onNavigate,
  onOpenAuth,
  onOpenMessengerWithContact,
}) => {
  const { user, profile, role, isAdmin, isTeacher } = useAuth();

  // Modals state
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Feed Filter state
  const [feedFilter, setFeedFilter] = useState<'all' | 'announcement' | 'question' | 'note' | 'achievement'>('all');

  // Local likes tracking
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [expandedCommentsPostIds, setExpandedCommentsPostIds] = useState<Record<string, boolean>>({});

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Stories Data
  const sampleStories: StoryItem[] = [
    {
      id: 's1',
      authorName: 'ดร. ภาณุพงศ์ (อาจารย์)',
      authorRole: 'teacher',
      title: 'อัปเดตบทเรียนใหม่: React 19 และ Next.js',
      description: 'เพิ่มบทเรียนใหม่เรื่อง Server Actions และ Compiler ให้ทดลองใช้งานแล้วในคอร์ส Full-Stack',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      createdAt: '1 ชม. ที่แล้ว',
      tag: 'บทเรียนใหม่',
    },
    {
      id: 's2',
      authorName: 'สมชาย วิจิตร (นักเรียน)',
      authorRole: 'student',
      title: '🎉 สอบผ่านควิซ Python 100 คะแนนเต็ม!',
      description: 'หลังจากทบทวนเรื่อง Dictionary และ List Comprehension มา 3 วัน วันนี้ทำควิซผ่านฉลุยแล้วครับ ขอบคุณอาจารย์ครับ',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      createdAt: '2 ชม. ที่แล้ว',
      tag: 'ความสำเร็จ',
    },
    {
      id: 's3',
      authorName: 'LearnSpace Community',
      authorRole: 'admin',
      title: '💡 ทริกประจำสัปดาห์: Git Rebase vs Merge',
      description: 'เลือกใช้ Rebase เพื่อประวัติ Commit ที่เรียบง่าย หรือ Merge เพื่อเก็บ Branch Context ที่ครบถ้วน',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      createdAt: '4 ชม. ที่แล้ว',
      tag: 'เคล็ดลับโค้ด',
    },
    {
      id: 's4',
      authorName: 'อ. กิตติศักดิ์',
      authorRole: 'teacher',
      title: '📝 เตือนกำหนดส่ง Assignment: Data Modeling',
      description: 'กำหนดส่งถึงวันศุกร์นี้ เวลา 23:59 น. อย่าลืมตรวจสอบ Schema ใน Firestore ก่อนส่งนะครับ',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      createdAt: '6 ชม. ที่แล้ว',
      tag: 'การบ้าน',
    },
  ];

  // Online contacts / classmates
  const classmates = [
    { name: 'ดร. ภาณุพงศ์ (อาจารย์ผู้สอน)', role: 'อาจารย์', online: true },
    { name: 'สมชาย วิจิตร', role: 'นักเรียน', online: true },
    { name: 'พิมพ์ใจ รัตนพร', role: 'นักเรียน', online: true },
    { name: 'กิตติศักดิ์ ชาญวิทย์', role: 'ผู้ช่วยสอน', online: true },
    { name: 'อนุรักษ์ เจริญผล', role: 'นักเรียน', online: false },
    { name: 'วรรณา สดใส', role: 'นักเรียน', online: true },
  ];

  const handleLikePost = (postId: string) => {
    setLikedPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleToggleComments = (postId: string) => {
    setExpandedCommentsPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    if (!user) {
      onOpenAuth('login');
      return;
    }

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      await addDoc(collection(db, 'replies'), {
        topicId: postId,
        authorId: user.uid,
        authorName: profile?.displayName || user.email?.split('@')[0] || 'ผู้เรียน',
        authorRole: role || 'student',
        content: text,
        isAcceptedAnswer: false,
        createdAt: new Date().toISOString(),
      });

      // Increment reply counter on topic
      try {
        await updateDoc(doc(db, 'discussions', postId), {
          replyCount: increment(1),
        });
      } catch (e) {
        // non-blocking
      }

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setExpandedCommentsPostIds((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'replies');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Filter discussions
  const filteredDiscussions = discussions.filter((d) => {
    if (feedFilter === 'announcement') return d.isPinned || d.title.includes('ประกาศ');
    if (feedFilter === 'question') return d.title.includes('คำถาม') || d.title.includes('❓');
    if (feedFilter === 'note') return d.title.includes('สรุป') || d.title.includes('💡');
    if (feedFilter === 'achievement') return d.title.includes('ความสำเร็จ') || d.title.includes('🎉');
    return true;
  });

  return (
    <div className="bg-[#F0F2F5] min-h-[calc(100vh-3.5rem)] text-slate-900 font-sans select-none">
      
      {/* 1. Global Announcement Banner (if configured) */}
      {settings?.announcementBanner?.enabled && (
        <div className="bg-[#1877F2] text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{settings.announcementBanner.text}</span>
          <button
            onClick={() => onNavigate('courses')}
            className="underline ml-1 font-bold hover:text-blue-100"
          >
            ดูรายละเอียด
          </button>
        </div>
      )}

      {/* 2. Main Facebook 3-Column Container */}
      <div className="max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-6 flex justify-between gap-6">
        
        {/* =========================================================
            LEFT COLUMN: Facebook Shortcuts, Profile & Navigation
        ========================================================= */}
        <aside className="w-[280px] xl:w-[320px] hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-3 space-y-1 shrink-0 text-slate-800">
          
          {/* User Profile Row */}
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1877F2] transition-colors">
                  {profile?.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {role === 'teacher' ? 'อาจารย์ผู้สอน' : role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-colors text-left mb-2 shadow-xs"
            >
              <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
                L
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">เข้าสู่ระบบ LearnSpace</p>
                <p className="text-[10px] text-slate-500">เพื่อเข้าถึงบทเรียนและการบ้าน</p>
              </div>
            </button>
          )}

          {/* Core Facebook Navigation Items */}
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => onNavigate('courses')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left text-xs font-semibold text-slate-800"
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">คลังคอร์สทั้งหมด</p>
                <p className="text-[10px] text-slate-500">{courses.length} บทเรียนพร้อมเรียน</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('assignments')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left text-xs font-semibold text-slate-800"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">การบ้าน & กิจกรรม</p>
                <p className="text-[10px] text-slate-500">ส่งงานและตรวจคะแนน</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('discussions')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left text-xs font-semibold text-slate-800"
            >
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">กลุ่ม & กระดานถามตอบ</p>
                <p className="text-[10px] text-slate-500">พูดคุยแลกเปลี่ยนแบบ Realtime</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left text-xs font-semibold text-slate-800"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">แดชบอร์ด & ควิซ</p>
                <p className="text-[10px] text-slate-500">คะแนนสะสมและเกียรติบัตร</p>
              </div>
            </button>

            {(isAdmin || isTeacher) && (
              <button
                onClick={() => onNavigate('admin')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left text-xs font-semibold text-purple-900"
              >
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-purple-900">ศูนย์ควบคุมแอดมิน (CMS)</p>
                  <p className="text-[10px] text-purple-600">จัดการข้อมูล & ตรวจสอบระบบ</p>
                </div>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="pt-2 pb-1 border-t border-slate-200 mt-2" />

          {/* Your Shortcuts (ทางลัดของคุณ) */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              ทางลัดของคุณ
            </p>
            {courses.slice(0, 4).map((course) => (
              <button
                key={course.id}
                onClick={() => onNavigate('course-detail', { courseId: course.id })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left text-xs font-medium text-slate-800 group"
              >
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-7 h-7 rounded-lg object-cover shadow-xs shrink-0"
                />
                <span className="truncate group-hover:text-[#1877F2] font-semibold">
                  {course.title}
                </span>
              </button>
            ))}
          </div>

          {/* Facebook Style Small Footer */}
          <div className="px-3 pt-6 text-[11px] text-slate-400 space-y-1">
            <p className="hover:underline cursor-pointer">ความเป็นส่วนตัว · ข้อกำหนด · คุกกี้ · ทางเลือกโฆษณา</p>
            <p>LearnSpace Platform © 2026 · สถาปัตยกรรม Firebase Realtime</p>
          </div>
        </aside>

        {/* =========================================================
            CENTER COLUMN: Facebook Main Feed (Stories, Post Box, Posts)
        ========================================================= */}
        <main className="flex-1 max-w-[680px] mx-auto py-4 space-y-4 min-w-0">
          
          {/* 1. Facebook Stories Carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
            {/* Create Story Card */}
            <div
              onClick={() => setCreatePostModalOpen(true)}
              className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl bg-white shadow-xs border border-slate-200/90 flex flex-col overflow-hidden shrink-0 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all group relative"
            >
              <div className="h-32 sm:h-36 bg-gradient-to-tr from-blue-100 to-sky-200 relative overflow-hidden flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-[#1877F2]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="relative flex-1 bg-white flex flex-col items-center justify-center pb-1">
                <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center -mt-6 border-4 border-white shadow-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 font-bold" />
                </div>
                <p className="text-[11px] font-bold text-slate-900 mt-1">สร้างสตอรี่</p>
              </div>
            </div>

            {/* Stories Cards */}
            {sampleStories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => {
                  setActiveStoryIndex(idx);
                  setStoryViewerOpen(true);
                }}
                className="w-28 sm:w-32 h-44 sm:h-48 rounded-xl overflow-hidden shadow-xs border border-slate-200/90 shrink-0 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all relative group"
              >
                <img
                  src={story.image}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                
                {/* Story Author Avatar at top left */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <div className="w-8 h-8 rounded-full border-2 border-[#1877F2] bg-white text-[#1877F2] flex items-center justify-center font-bold text-xs shadow-xs">
                    {story.authorName.charAt(0)}
                  </div>
                </div>

                {/* Story text at bottom */}
                <div className="absolute bottom-2.5 left-2 right-2 z-10 text-white">
                  <p className="text-[11px] font-bold leading-tight line-clamp-2 drop-shadow-sm">
                    {story.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Facebook Post Creator Card ("คุณกำลังคิดอะไรอยู่?") */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={() => {
                  if (!user) onOpenAuth('login');
                  else setCreatePostModalOpen(true);
                }}
                className="flex-1 bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors rounded-full px-4 py-2.5 text-left text-xs sm:text-sm text-slate-500 font-medium truncate"
              >
                {user
                  ? `คุณกำลังเรียนรู้อะไรอยู่, ${profile?.displayName || user.email?.split('@')[0]}?`
                  : 'เข้าสู่ระบบเพื่อโพสต์คำถามหรือแชร์ความคืบหน้า...'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600 text-xs font-semibold">
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="flex-1 py-1.5 px-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors text-rose-500"
              >
                <Tv className="w-5 h-5" />
                <span className="hidden sm:inline text-slate-700">คลาสสด</span>
              </button>
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="flex-1 py-1.5 px-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors text-emerald-500"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="hidden sm:inline text-slate-700">รูป/โน้ตย่อ</span>
              </button>
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="flex-1 py-1.5 px-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors text-amber-500"
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline text-slate-700">ถามอาจารย์</span>
              </button>
              <button
                onClick={() => setCreatePostModalOpen(true)}
                className="flex-1 py-1.5 px-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors text-[#1877F2]"
              >
                <Award className="w-5 h-5" />
                <span className="hidden sm:inline text-slate-700">ความสำเร็จ</span>
              </button>
            </div>
          </div>

          {/* 3. Feed Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                feedFilter === 'all'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-[#E4E6EB] border border-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFeedFilter('announcement')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                feedFilter === 'announcement'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-[#E4E6EB] border border-slate-200'
              }`}
            >
              📢 ประกาศอาจารย์
            </button>
            <button
              onClick={() => setFeedFilter('question')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                feedFilter === 'question'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-[#E4E6EB] border border-slate-200'
              }`}
            >
              ❓ คำถาม & ปัญหา
            </button>
            <button
              onClick={() => setFeedFilter('note')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                feedFilter === 'note'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-[#E4E6EB] border border-slate-200'
              }`}
            >
              💡 สรุปบทเรียน
            </button>
            <button
              onClick={() => setFeedFilter('achievement')}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                feedFilter === 'achievement'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-[#E4E6EB] border border-slate-200'
              }`}
            >
              🎉 ความสำเร็จ
            </button>
          </div>

          {/* 4. Facebook Posts Stream */}
          <div className="space-y-4">
            {filteredDiscussions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-200/90 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center mx-auto">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">ยังไม่มีโพสต์ในหมวดหมู่นี้</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ร่วมเป็นคนแรกที่สร้างโพสต์ แบ่งปันความรู้ หรือถามข้อสงสัยในชั้นเรียนได้เลยครับ
                </p>
                <button
                  onClick={() => setCreatePostModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#1877F2] text-white text-xs font-bold hover:bg-[#166FE5] shadow-xs"
                >
                  สร้างโพสต์แรกเลย
                </button>
              </div>
            ) : (
              filteredDiscussions.map((post) => {
                const isLiked = !!likedPostIds[post.id];
                const showComments = !!expandedCommentsPostIds[post.id];
                const postReplies = replies.filter((r) => r.topicId === post.id);
                const relatedCourse = courses.find((c) => c.id === post.courseId);

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden space-y-3 animate-in fade-in duration-150"
                  >
                    {/* Post Header */}
                    <div className="p-4 pb-0 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 hover:underline cursor-pointer">
                              {post.authorName}
                            </span>
                            {post.authorRole === 'teacher' && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md font-bold">
                                อาจารย์ผู้สอน
                              </span>
                            )}
                            {post.authorRole === 'admin' && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-md font-bold">
                                ผู้ดูแลระบบ
                              </span>
                            )}
                            {post.isPinned && (
                              <span className="text-[10px] bg-blue-100 text-[#1877F2] px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                                📌 ปักหมุด
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <span>{new Date(post.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</span>
                            <span>·</span>
                            <Globe className="w-3 h-3 text-slate-400" />
                            {post.courseTitle && (
                              <>
                                <span>·</span>
                                <span className="text-[#1877F2] font-semibold truncate max-w-[150px]">
                                  {post.courseTitle}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="p-1.5 hover:bg-[#F0F2F5] rounded-full text-slate-500">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 space-y-2">
                      <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-normal whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Embedded Course Card Attachment (if associated) */}
                    {relatedCourse && (
                      <div
                        onClick={() => onNavigate('course-detail', { courseId: relatedCourse.id })}
                        className="mx-4 p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={relatedCourse.coverImage}
                            alt={relatedCourse.title}
                            className="w-12 h-12 rounded-lg object-cover shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-[#1877F2] uppercase">
                              คอร์สเรียนที่เกี่ยวข้อง
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1877F2] transition-colors">
                              {relatedCourse.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              สอนโดย: {relatedCourse.instructorName} · {relatedCourse.totalLessons} บทเรียน
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1877F2] shrink-0" />
                      </div>
                    )}

                    {/* Post Reactions & Comment Count Bar */}
                    <div className="px-4 py-1 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1">
                          <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px]">
                            👍
                          </span>
                          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px]">
                            ❤️
                          </span>
                        </div>
                        <span>{(post.replyCount || 0) + (isLiked ? 1 : 0)} คน</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="hover:underline"
                        >
                          {postReplies.length} ความคิดเห็น
                        </button>
                        <span>แชร์ 2 ครั้ง</span>
                      </div>
                    </div>

                    {/* Facebook Action Buttons Bar (Like, Comment, Share) */}
                    <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100 text-xs font-semibold text-slate-600">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex-1 py-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors ${
                          isLiked ? 'text-[#1877F2] font-bold' : ''
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#1877F2]' : ''}`} />
                        <span>{isLiked ? 'ถูกใจแล้ว' : 'ถูกใจ'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className="flex-1 py-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>แสดงความคิดเห็น</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          alert('คัดลอกลิงก์โพสต์เรียบร้อยแล้ว');
                        }}
                        className="flex-1 py-2 hover:bg-[#F0F2F5] rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>แชร์</span>
                      </button>
                    </div>

                    {/* Facebook Nested Comments Section */}
                    {showComments && (
                      <div className="px-4 pb-4 space-y-3 pt-1 animate-in fade-in duration-150">
                        {/* List of Replies */}
                        {postReplies.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            {postReplies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                                  {reply.authorName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="bg-[#F0F2F5] rounded-2xl px-3 py-2 text-xs inline-block max-w-full">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900">
                                        {reply.authorName}
                                      </span>
                                      {reply.authorRole === 'teacher' && (
                                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                                          ผู้สอน
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-slate-800 mt-0.5 whitespace-pre-line leading-relaxed">
                                      {reply.content}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold mt-0.5 px-2">
                                    <span className="hover:underline cursor-pointer">ถูกใจ</span>
                                    <span className="hover:underline cursor-pointer">ตอบกลับ</span>
                                    <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input Box */}
                        <div className="flex items-start gap-2.5 pt-1">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1877F2] to-sky-400 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1 relative flex items-center">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(post.id);
                              }}
                              placeholder="เขียนความคิดเห็นของคุณ..."
                              className="w-full bg-[#F0F2F5] hover:bg-[#E4E6EB] focus:bg-white text-xs rounded-full pl-3.5 pr-10 py-2 border border-transparent focus:border-slate-300 focus:outline-none transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!(commentInputs[post.id] || '').trim() || submittingComment[post.id]}
                              className="absolute right-2 text-[#1877F2] disabled:opacity-40 hover:scale-110 transition-transform"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* =========================================================
            RIGHT COLUMN: Sponsored/Deadlines, Suggested Courses & Contacts
        ========================================================= */}
        <aside className="w-[280px] xl:w-[320px] hidden xl:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-3 space-y-4 shrink-0 text-slate-800">
          
          {/* 1. Upcoming Deadlines & Quizzes Card */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>กำหนดการส่งงานใกล้ถึง</span>
              </h3>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md">
                ด่วน
              </span>
            </div>
            
            <div
              onClick={() => onNavigate('assignments')}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/80 space-y-1"
            >
              <p className="text-xs font-bold text-slate-900 leading-snug">
                Assignment 1: Data Analytics Report
              </p>
              <p className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>กำหนดส่ง: วันนี้ 23:59 น.</span>
                <span className="text-emerald-600 font-bold">100 คะแนน</span>
              </p>
            </div>
          </div>

          {/* 2. Suggested Courses for You */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>คอร์สแนะนำสำหรับคุณ</span>
              </h3>
              <button
                onClick={() => onNavigate('courses')}
                className="text-[11px] text-[#1877F2] font-semibold hover:underline"
              >
                ดูทั้งหมด
              </button>
            </div>

            <div className="space-y-2.5">
              {courses.slice(0, 2).map((course) => (
                <div
                  key={course.id}
                  onClick={() => onNavigate('course-detail', { courseId: course.id })}
                  className="flex gap-2.5 cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-14 h-14 rounded-lg object-cover shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1877F2] transition-colors truncate">
                      {course.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{course.instructorName}</p>
                    <button className="mt-1 text-[10px] font-bold text-[#1877F2] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors">
                      เริ่มเรียนฟรี
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Classmates & Contacts List (Click to open Facebook Messenger!) */}
          <div className="space-y-2 pt-1">
            <div className="px-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ผู้ติดต่อ & เพื่อนร่วมคลาส
              </h3>
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="space-y-0.5">
              {classmates.map((person, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (onOpenMessengerWithContact) {
                      onOpenMessengerWithContact(person.name);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#E4E6EB] transition-colors text-left group"
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                      {person.name.charAt(0)}
                    </div>
                    {person.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#1877F2] transition-colors">
                      {person.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{person.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Story Viewer Modal */}
      <StoryViewerModal
        stories={sampleStories}
        initialIndex={activeStoryIndex}
        isOpen={storyViewerOpen}
        onClose={() => setStoryViewerOpen(false)}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        courses={courses}
      />
    </div>
  );
};
