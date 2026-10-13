/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, auth, testConnection, handleFirestoreError, OperationType } from './lib/firebase';
import { seedInitialDatabaseIfEmpty } from './lib/seedData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FacebookNavbar } from './components/facebook/FacebookNavbar';
import { FacebookMessenger } from './components/facebook/FacebookMessenger';
import { CreatePostModal } from './components/facebook/CreatePostModal';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardSkeleton } from './components/common/LoadingSkeleton';
import { ShieldAlert, Lock } from 'lucide-react';

// Views
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { CourseDetailView } from './views/CourseDetailView';
import { LessonView } from './views/LessonView';
import { QuizView } from './views/QuizView';
import { AssignmentView } from './views/AssignmentView';
import { DiscussionView } from './views/DiscussionView';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';

import type {
  Course,
  Lesson,
  Quiz,
  QuizAttempt,
  Assignment,
  Submission,
  Discussion,
  Reply,
  SiteSettings,
  UserProgress,
} from './types';

function MainApp() {
  const { user, profile, isAdmin, isTeacher, loading: authLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Facebook UI States (Messenger dock & Create post modal)
  const [messengerOpen, setMessengerOpen] = useState(false);
  const [messengerContact, setMessengerContact] = useState<string | undefined>(undefined);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  // Firestore Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  // Initial Boot: Test connection & seed initial database if empty
  useEffect(() => {
    async function boot() {
      await testConnection();
      await seedInitialDatabaseIfEmpty();
    }
    boot();
  }, []);

  // Realtime Listeners for Public / Platform-wide Collections
  useEffect(() => {
    // 1. Courses
    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
        setCourses(list);
        setLoadingData(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'courses')
    );

    // 2. Lessons
    const unsubLessons = onSnapshot(
      collection(db, 'lessons'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
        setLessons(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'lessons')
    );

    // 3. Quizzes
    const unsubQuizzes = onSnapshot(
      collection(db, 'quizzes'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
        setQuizzes(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'quizzes')
    );

    // 4. Assignments
    const unsubAssignments = onSnapshot(
      collection(db, 'assignments'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment));
        setAssignments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'assignments')
    );

    // 5. Discussions
    const unsubDiscussions = onSnapshot(
      collection(db, 'discussions'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Discussion));
        setDiscussions(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'discussions')
    );

    // 6. Replies
    const unsubReplies = onSnapshot(
      collection(db, 'replies'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reply));
        setReplies(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'replies')
    );

    // 7. Site Settings
    const unsubSettings = onSnapshot(
      doc(db, 'site_settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'site_settings/global')
    );

    return () => {
      unsubCourses();
      unsubLessons();
      unsubQuizzes();
      unsubAssignments();
      unsubDiscussions();
      unsubReplies();
      unsubSettings();
    };
  }, []);

  // Listeners that depend on Authenticated User
  useEffect(() => {
    if (!user) {
      setCompletedLessonIds([]);
      setSubmissions([]);
      setQuizAttempts([]);
      return;
    }

    // Check if demo user, offline session, or no real Firebase Auth session yet
    const isDemoOrOffline =
      !auth.currentUser ||
      user.uid.startsWith('demo-') ||
      user.uid === 'teacher-somchai' ||
      user.uid === 'admin-learnspace-root';

    if (isDemoOrOffline) {
      // Demo session sample state
      setCompletedLessonIds(['lesson-web-1']);
      setSubmissions([
        {
          id: 'demo-sub-1',
          assignmentId: 'assign-web-1',
          assignmentTitle: 'การบ้านชิ้นที่ 1: ออกแบบ Schema ฐานข้อมูลและสร้างแผนผัง REST API',
          courseId: 'course-web-dev',
          studentId: user.uid,
          studentName: profile?.displayName || 'นักศึกษาตัวอย่าง',
          content: 'ได้ออกแบบ Schema และส่งผัง ERD ครบถ้วนตามโจทย์',
          status: 'graded',
          score: 95,
          feedback: 'ออกแบบ Schema ได้ครอบคลุมและมีมาตรการ Zero-Trust ชัดเจนดีมาก',
          submittedAt: new Date().toISOString(),
        },
      ]);
      setQuizAttempts([
        {
          id: 'demo-attempt-1',
          quizId: 'quiz-web-1',
          courseId: 'course-web-dev',
          userId: user.uid,
          userName: profile?.displayName || 'นักศึกษาตัวอย่าง',
          score: 4,
          totalScore: 4,
          percentage: 100,
          passed: true,
          answers: [],
          submittedAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    if (!auth.currentUser) {
      return;
    }
    const currentUid = auth.currentUser.uid;

    // 8. User Progress
    const progressQuery = query(
      collection(db, 'user_progress'),
      where('userId', '==', currentUid)
    );
    const unsubProgress = onSnapshot(
      progressQuery,
      (snap) => {
        const ids = snap.docs
          .map((d) => d.data() as UserProgress)
          .filter((p) => p.completed)
          .map((p) => p.lessonId);
        setCompletedLessonIds(ids);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'user_progress')
    );

    // 9. Submissions (Student queries theirs, Teacher/Admin queries all)
    const submissionsQuery =
      isAdmin || isTeacher
        ? collection(db, 'submissions')
        : query(collection(db, 'submissions'), where('studentId', '==', currentUid));

    const unsubSubmissions = onSnapshot(
      submissionsQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission));
        setSubmissions(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'submissions')
    );

    // 10. Quiz Attempts
    const attemptsQuery = query(
      collection(db, 'quiz_attempts'),
      where('userId', '==', currentUid)
    );
    const unsubAttempts = onSnapshot(
      attemptsQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizAttempt));
        setQuizAttempts(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'quiz_attempts')
    );

    return () => {
      unsubProgress();
      unsubSubmissions();
      unsubAttempts();
    };
  }, [user, profile, isAdmin, isTeacher]);

  const handleNavigate = (view: string, params: any = {}) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    setViewParams(params);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleToggleLessonComplete = async (lessonId: string, completed: boolean) => {
    if (!user) return;
    const key = `${user.uid}_${lessonId}`;
    const ref = doc(db, 'user_progress', key);
    if (completed) {
      const currentLesson = lessons.find((l) => l.id === lessonId);
      await setDoc(ref, {
        id: key,
        userId: user.uid,
        courseId: currentLesson?.courseId || '',
        lessonId,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  };

  const handleRefreshData = async () => {
    // triggers rerender
    const snap = await getDocs(collection(db, 'courses'));
    setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
  };

  // Find active course / lesson / quiz by params
  const activeCourse = courses.find((c) => c.id === viewParams.courseId) || courses[0];
  const activeLesson = lessons.find((l) => l.id === viewParams.lessonId) || lessons[0];
  const activeQuiz = quizzes.find((q) => q.id === viewParams.quizId) || quizzes[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5] text-slate-900 font-sans selection:bg-[#1877F2] selection:text-white">
      
      {/* Facebook Fixed Top Header */}
      <FacebookNavbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onToggleMessenger={() => setMessengerOpen(!messengerOpen)}
        onOpenCreatePost={() => setCreatePostModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
        <main className="flex-1">
          {loadingData ? (
            <DashboardSkeleton />
          ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                courses={courses}
                settings={settings}
                discussions={discussions}
                replies={replies}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
                onOpenMessengerWithContact={(contact) => {
                  setMessengerContact(contact);
                  setMessengerOpen(true);
                }}
              />
            )}

            {currentView === 'courses' && (
              <CatalogView
                courses={courses}
                initialSearch={viewParams.search || ''}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'course-detail' && activeCourse && (
              <CourseDetailView
                course={activeCourse}
                lessons={lessons}
                quizzes={quizzes}
                assignments={assignments}
                completedLessonIds={completedLessonIds}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentView === 'lesson' && activeLesson && (
              <LessonView
                course={courses.find((c) => c.id === activeLesson.courseId) || activeCourse}
                lesson={activeLesson}
                allCourseLessons={lessons.filter((l) => l.courseId === activeLesson.courseId)}
                discussions={discussions}
                isCompleted={completedLessonIds.includes(activeLesson.id)}
                onToggleComplete={handleToggleLessonComplete}
                onNavigate={handleNavigate}
                onOpenNewDiscussion={(lessonId, courseId) => {
                  handleNavigate('discussions', { initialCourseFilter: courseId });
                }}
              />
            )}

            {currentView === 'quiz' && activeQuiz && (
              <QuizView
                quiz={activeQuiz}
                course={courses.find((c) => c.id === activeQuiz.courseId)}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {(currentView === 'assignments' || currentView === 'assignment-submit') && (
              <AssignmentView
                assignments={assignments}
                submissions={submissions}
                courses={courses}
                selectedAssignmentId={viewParams.selectedAssignmentId || viewParams.assignmentId}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {(currentView === 'discussions' || currentView === 'discussion-detail') && (
              <DiscussionView
                discussions={discussions}
                replies={replies}
                courses={courses}
                initialCourseFilter={viewParams.courseFilter || null}
                selectedTopicId={viewParams.topicId || null}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                courses={courses}
                lessons={lessons}
                submissions={submissions}
                quizAttempts={quizAttempts}
                completedLessonIds={completedLessonIds}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView courses={courses} onNavigate={handleNavigate} />
            )}

            {currentView === 'admin' && (
              isAdmin ? (
                <AdminView
                  courses={courses}
                  lessons={lessons}
                  quizzes={quizzes}
                  assignments={assignments}
                  submissions={submissions}
                  discussions={discussions}
                  settings={settings}
                  onNavigate={handleNavigate}
                  onRefreshData={handleRefreshData}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">สงวนสิทธิ์เฉพาะผู้ดูแลระบบ</h2>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      ส่วนนี้เปิดให้เข้าถึงและจัดการเนื้อหาเฉพาะผู้ดูแลระบบหลัก (<span className="font-semibold text-slate-700">bbak9988@gmail.com</span>) เท่านั้น ผู้ใช้ทั่วไปไม่สามารถปรับเปลี่ยนเนื้อหาหรือหน้าตาของระบบได้
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => handleOpenAuth('login')}
                      className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>เข้าสู่ระบบด้วยบัญชีผู้ดูแล (bbak9988@gmail.com)</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('home')}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                    >
                      กลับสู่หน้าหลัก
                    </button>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>

      {/* Facebook Messenger Floating Dock (Bottom Right) */}
      <FacebookMessenger
        isOpen={messengerOpen}
        onClose={() => setMessengerOpen(false)}
        activeContactName={messengerContact}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Facebook Create Post Dialog */}
      <CreatePostModal
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        courses={courses}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
