export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  bio?: string;
  enrolledCourses?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  coverImage: string;
  instructorId: string;
  instructorName: string;
  published: boolean;
  totalLessons: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  name: string;
  url: string;
  size: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  order: number;
  summary: string;
  contentHtml: string;
  videoUrl?: string;
  attachments?: Attachment[];
  published: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  passingScore: number; // e.g. 70 (%)
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  userId: string;
  userName: string;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  answers: { questionId: string; selectedIndex: number }[];
  submittedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  allowLate: boolean;
  createdAt: string;
}

export type SubmissionStatus = 'submitted' | 'graded' | 'resubmit_required';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  courseId: string;
  studentId: string;
  studentName: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  status: SubmissionStatus;
  score?: number | null;
  feedback?: string | null;
  gradedBy?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
}

export interface Discussion {
  id: string;
  courseId?: string | null;
  courseTitle?: string;
  lessonId?: string | null;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  replyCount: number;
  isSolved: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Reply {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isAcceptedAnswer: boolean;
  createdAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string;
}

export interface SiteSettings {
  siteName: string;
  announcementBanner: {
    text: string;
    enabled: boolean;
    link?: string;
  };
  heroConfig: {
    title: string;
    subtitle: string;
  };
}
