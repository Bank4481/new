import React, { useState } from 'react';
import { Search, Filter, BookOpen, Clock, User, ArrowRight, Sparkles } from 'lucide-react';
import type { Course } from '../types';

interface CatalogViewProps {
  courses: Course[];
  initialSearch?: string;
  onNavigate: (view: string, payload?: any) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  courses,
  initialSearch = '',
  onNavigate,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'ทุกหมวดหมู่' },
    { id: 'วิทยาการคอมพิวเตอร์', label: 'วิทยาการคอมพิวเตอร์' },
    { id: 'ข้อมูลและปัญญาประดิษฐ์', label: 'ข้อมูลและ AI' },
    { id: 'วิทยาศาสตร์และคณิตศาสตร์', label: 'คณิตศาสตร์และวิทย์' },
  ];

  const levels = [
    { id: 'all', label: 'ทุกระดับ' },
    { id: 'beginner', label: 'ระดับต้น (Beginner)' },
    { id: 'intermediate', label: 'ระดับกลาง (Intermediate)' },
    { id: 'advanced', label: 'ระดับสูง (Advanced)' },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      search === '' ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || course.category === selectedCategory;

    const matchesLevel =
      selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          แคตตาล็อกคอร์สและสื่อการเรียนรู้
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          ค้นหาบทเรียนที่ตรงกับเป้าหมายการพัฒนาทักษะของคุณ จากคณาจารย์ผู้ทรงคุณวุฒิ
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อวิชา อาจารย์ หรือคำสำคัญ..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="md:col-span-3 flex justify-end">
            {(search || selectedCategory !== 'all' || selectedLevel !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                className="text-xs text-amber-700 hover:text-amber-900 font-semibold py-2 px-3 self-center"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Functional filter tabs) */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
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
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">ไม่พบคอร์สที่ตรงกับเงื่อนไขการค้นหา</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูรายวิชาอื่นในระบบ
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            แสดงคอร์สทั้งหมด
          </button>
        </div>
      )}

    </div>
  );
};
