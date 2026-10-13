import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle,
  Users,
  Award,
  ArrowRight,
  Sparkles,
  Compass,
  FileCheck2,
  MessagesSquare,
  ShieldAlert,
  Play,
} from 'lucide-react';
import type { Course, SiteSettings } from '../types';

interface HomeViewProps {
  courses: Course[];
  settings: SiteSettings | null;
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  courses,
  settings,
  onNavigate,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('courses', { search: searchQuery });
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Announcement Banner */}
      {settings?.announcementBanner?.enabled && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-950 px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{settings.announcementBanner.text}</span>
          <button
            onClick={() => onNavigate('courses')}
            className="underline font-bold text-amber-800 hover:text-amber-950 ml-1"
          >
            ดูรายละเอียด
          </button>
        </div>
      )}

      {/* 2. Hero Section (Academic Classic 2-Column Split with Rich Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md w-fit">
              <span>แพลตฟอร์มการเรียนรู้ระดับอุดมศึกษาและชุมชนวิชาการ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2] font-['Plus_Jakarta_Sans',sans-serif] text-balance">
              {settings?.heroConfig?.title || 'พื้นที่แห่งการเรียนรู้ไร้ขีดจำกัด พัฒนาทักษะสู่อนาคต'}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-light">
              {settings?.heroConfig?.subtitle ||
                'เรียนรู้วิทยาการคอมพิวเตอร์ วิทยาศาสตร์ข้อมูล และคณิตศาสตร์ประยุกต์ ผ่านระบบบทเรียนแบบสื่อผสม แบบทดสอบอัตโนมัติ และระบบส่งงานที่มีมาตรฐาน'}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อวิชา เช่น Full-Stack, AI, Data Science..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors shrink-0"
              >
                ค้นหาบทเรียน
              </button>
            </form>

            {/* Quick Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>รองรับงานส่งและแบบทดสอบจริง</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>จัดเก็บข้อมูล Cloud Firestore มั่นคง</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>อาจารย์ตรวจงานและให้คำติชมตรง</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-900 group min-h-[360px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_learnspace_banner_1791865330442.jpg"
              alt="ห้องสมุดและศูนย์การเรียนรู้ LearnSpace"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                ห้องเรียนเสมือนจริง (Virtual Academy)
              </span>
              <h3 className="text-lg font-bold text-white mb-2">
                LearnSpace Academic Learning Hub
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                เชื่อมต่อนักเรียนและคณาจารย์ในแพลตฟอร์มเดียว สะดวก รวดเร็ว และเป็นระเบียบ
              </p>
              <button
                onClick={() => onNavigate('courses')}
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors w-fit"
              >
                <span>สำรวจรายวิชาทั้งหมด</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Three-Step Learning Path */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            เส้นทางการเรียนรู้ (Learning Journey)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            ก้าวสู่ความเป็นเลิศใน 3 ขั้นตอน
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            ระบบที่ออกแบบอย่างเป็นขั้นเป็นตอน ตั้งแต่การรับชมบทเรียน ทำแบบฝึกหัด จนถึงการมีส่วนร่วมในชุมชน
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-base mb-4 font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              เลือกวิชาและเรียนรู้ผ่านสื่อผสม
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              ศึกษาเนื้อหาผ่านวิดีโอบรรยาย เอกสารคู่มือดาวน์โหลดได้ และตัวอย่างโค้ดที่ถูกต้องตามมาตรฐาน
            </p>
            <div className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>หลักสูตรปรับปรุงใหม่ปี 2026</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900 font-bold text-base mb-4 font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              ทดสอบความรู้และส่งงานปฏิบัติการ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              ทำแบบทดสอบปรนัยประเมินผลทันที ส่งการบ้านพร้อมแนบไฟล์ และรับผลคะแนนพร้อมข้อเสนอแนะจากอาจารย์
            </p>
            <div className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4" />
              <span>ตรวจคำตอบและคำนวณคะแนนอัตโนมัติ</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-base mb-4 font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              แลกเปลี่ยนในชุมชนถาม-ตอบ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              สงสัยจุดไหนตั้งกระทู้ถามได้ทันทีในแต่ละบทเรียน ร่วมตอบคำถามเพื่อนร่วมชั้น และสะสมคะแนนวิชาการ
            </p>
            <div className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
              <MessagesSquare className="w-4 h-4" />
              <span>กระทู้ถาม-ตอบเชื่อมต่อบทเรียน</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              คอร์สเรียนแนะนำ (Featured Courses)
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              บทเรียนยอดนิยมประจำภาคเรียน
            </h2>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0"
          >
            <span>ดูคอร์สทั้งหมด ({courses.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <div
              key={course.id}
              onClick={() => onNavigate('course-detail', { courseId: course.id })}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {course.category}
                </div>
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {course.level}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{course.instructorName}</span>
                  <div className="flex items-center gap-1 text-amber-700 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{course.totalLessons} บทเรียน</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Statistics / Trust Banner */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
                1,250+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">ผู้เรียนที่ลงทะเบียน</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
                100%
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">บทเรียนพร้อมใช้งานจริง</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
                4.9 / 5.0
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">คะแนนความพึงพอใจ</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
                Zero-Trust
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">สถาปัตยกรรมความปลอดภัย</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-slate-700">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              พร้อมที่จะเริ่มการเรียนรู้ใน LearnSpace แล้วหรือยัง?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              สมัครสมาชิกวันนี้เพื่อเข้าถึงบทเรียนทั้งหมด ส่งงานให้ผู้สอนประเมิน และแลกเปลี่ยนความรู้ในชุมชนการศึกษา
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenAuth('register')}
                className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                สมัครสมาชิกฟรี
              </button>
              <button
                onClick={() => onNavigate('courses')}
                className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors border border-white/20"
              >
                ดูแคตตาล็อกคอร์ส
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
