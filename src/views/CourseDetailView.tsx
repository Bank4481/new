import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  User,
  ArrowLeft,
  Play,
  FileCheck2,
  HelpCircle,
  MessagesSquare,
  Share2,
  Bookmark,
} from 'lucide-react';
import type { Course, Lesson, Quiz, Assignment } from '../types';
import { useAuth } from '../context/AuthContext';

interface CourseDetailViewProps {
  course: Course;
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
  completedLessonIds: string[];
  onNavigate: (view: string, payload?: any) => void;
  onOpenAuth: () => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  lessons,
  quizzes,
  assignments,
  completedLessonIds,
  onNavigate,
  onOpenAuth,
}) => {
  const { user, profile, updateUserProfile } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const isEnrolled = profile?.enrolledCourses?.includes(course.id) || false;

  const handleEnroll = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setEnrolling(true);
    try {
      const currentList = profile?.enrolledCourses || [];
      if (!currentList.includes(course.id)) {
        await updateUserProfile({
          enrolledCourses: [...currentList, course.id],
        });
      }
      if (lessons.length > 0) {
        onNavigate('lesson', { lessonId: lessons[0].id, courseId: course.id });
      }
    } catch (err) {
      console.error('Enroll error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const courseLessons = lessons
    .filter((l) => l.courseId === course.id)
    .sort((a, b) => a.order - b.order);

  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id);
  const courseAssignments = assignments.filter((a) => a.courseId === course.id);

  const completedCount = courseLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const progressPercent =
    courseLessons.length > 0
      ? Math.round((completedCount / courseLessons.length) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('courses')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปยังรายการคอร์สทั้งหมด</span>
      </button>

      {/* Hero Banner for Course */}
      <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Column Info */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-md font-semibold">
                {course.category}
              </span>
              <span className="text-slate-400 capitalize">· ระดับ {course.level}</span>
              <span className="text-slate-400">· {courseLessons.length} บทเรียน</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif] text-balance">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {course.description}
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                {course.instructorName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-slate-400">อาจารย์ผู้สอน</p>
                <p className="text-sm font-semibold text-white">{course.instructorName}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>
                  {enrolling
                    ? 'กำลังดำเนินการ...'
                    : isEnrolled
                    ? 'เข้าสู่ห้องเรียนต่อ'
                    : 'ลงทะเบียนเรียนฟรี'}
                </span>
              </button>

              <button
                onClick={() =>
                  onNavigate('discussions', { courseFilter: course.id })
                }
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 border border-slate-700"
              >
                <MessagesSquare className="w-4 h-4 text-amber-400" />
                <span>กระทู้ถาม-ตอบประจำวิชา</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Cover Preview */}
        <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto bg-slate-950">
          <img
            src={course.coverImage}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
            {isEnrolled && (
              <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">ความคืบหน้าการเรียนรู้</span>
                  <span className="text-amber-400 font-mono font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  เรียนสำเร็จ {completedCount} จาก {courseLessons.length} บท
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Course Curriculum & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Lessons Syllabus */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              แผนการสอนและบทเรียน ({courseLessons.length} บท)
            </h2>
            <span className="text-xs text-slate-500">เรียงตามลำดับเนื้อหา</span>
          </div>

          <div className="space-y-3">
            {courseLessons.map((lesson) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              return (
                <div
                  key={lesson.id}
                  onClick={() =>
                    onNavigate('lesson', { lessonId: lesson.id, courseId: course.id })
                  }
                  className="group cursor-pointer p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-900'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : lesson.order}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {lesson.summary}
                      </p>
                      {lesson.attachments && lesson.attachments.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{lesson.attachments.length} ไฟล์เอกสารประกอบ</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <button className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {isCompleted ? 'ทบทวน' : 'เริ่มเรียน'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Course Assessments (Quizzes & Assignments) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quizzes Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>แบบทดสอบประจำวิชา</span>
            </div>
            {courseQuizzes.length > 0 ? (
              <div className="space-y-2">
                {courseQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    onClick={() => onNavigate('quiz', { quizId: quiz.id })}
                    className="cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900">{quiz.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{quiz.questions.length} ข้อคำถาม</span>
                      <span className="text-amber-700 font-semibold">เกณฑ์ผ่าน {quiz.passingScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">ยังไม่มีแบบทดสอบในวิชานี้</p>
            )}
          </div>

          {/* Assignments Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <FileCheck2 className="w-5 h-5 text-amber-600" />
              <span>การบ้านและโครงงาน</span>
            </div>
            {courseAssignments.length > 0 ? (
              <div className="space-y-2">
                {courseAssignments.map((assign) => (
                  <div
                    key={assign.id}
                    onClick={() => onNavigate('assignment-submit', { assignmentId: assign.id })}
                    className="cursor-pointer p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-900">{assign.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>คะแนนเต็ม {assign.maxScore}</span>
                      <span className="text-rose-600 font-medium">ส่งภายในกำหนด</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">ยังไม่มีงานที่มอบหมายในขณะนี้</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
