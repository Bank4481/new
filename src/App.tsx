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
import { db, testConnection, handleFirestoreError, OperationType } from './lib/firebase';
import { seedInitialDatabaseIfEmpty } from './lib/seedData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardSkeleton } from './components/common/LoadingSkeleton';

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

    if (user.uid.startsWith('demo-')) {
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

    // 8. User Progress
    const progressQuery = query(
      collection(db, 'user_progress'),
      where('userId', '==', user.uid)
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
        : query(collection(db, 'submissions'), where('studentId', '==', user.uid));

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
      where('userId', '==', user.uid)
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
  }, [user, isAdmin, isTeacher]);

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-['Prompt',sans-serif]">
      
      {/* Sidebar Navigation (Desktop Left Sidebar & Mobile Bars) */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content & Scrollable View Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0 overflow-x-hidden">
        <main className="flex-1">
          {loadingData ? (
            <DashboardSkeleton />
          ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                courses={courses}
                settings={settings}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
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
              <AdminView
                courses={courses}
                lessons={lessons}
                quizzes={quizzes}
                assignments={assignments}
                submissions={submissions}
                settings={settings}
                onNavigate={handleNavigate}
                onRefreshData={handleRefreshData}
              />
            )}
          </>
        )}
      </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>

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
