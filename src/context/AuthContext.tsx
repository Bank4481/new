import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, preferredRole?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  demoSignIn: (role: UserRole) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  setSimulatedRole: (role: UserRole | null) => void;
  simulatedRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email configured for this instance
const BOOTSTRAP_ADMIN_EMAIL = 'bbak9988@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('learnspace_demo_session');
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            // If email is the bootstrap admin email, ensure admin role
            if (currentUser.email === BOOTSTRAP_ADMIN_EMAIL && data.role !== 'admin') {
              await updateDoc(userRef, { role: 'admin' });
              data.role = 'admin';
            }
            setProfile(data);
          } else {
            // New user registration record
            const isDefaultAdmin = currentUser.email === BOOTSTRAP_ADMIN_EMAIL;
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'สมาชิก'),
              photoURL: currentUser.photoURL || '',
              role: isDefaultAdmin ? 'admin' : 'student',
              bio: 'นักเรียนในระบบ LearnSpace',
              enrolledCourses: ['course-web-dev'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Failed to load user profile from Firestore:', error);
        }
      } else {
        // Check if there is an active local demo / offline session in LocalStorage
        try {
          const stored = localStorage.getItem('learnspace_demo_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.user && parsed.profile) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Could not read demo session from localStorage', e);
        }
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string, name: string, preferredRole: UserRole = 'student') => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await firebaseUpdateProfile(cred.user, { displayName: name });
    }
    const isDefaultAdmin = email === BOOTSTRAP_ADMIN_EMAIL;
    const finalRole: UserRole = isDefaultAdmin ? 'admin' : preferredRole;

    const userProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: name || email.split('@')[0],
      photoURL: '',
      role: finalRole,
      bio: finalRole === 'teacher' ? 'อาจารย์ผู้สอน' : 'นักเรียนในระบบ LearnSpace',
      enrolledCourses: ['course-web-dev'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), userProfile);
      setProfile(userProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const demoSignIn = (targetRole: UserRole) => {
    let mockName = 'ธนกร (นักศึกษาตัวอย่าง)';
    let mockEmail = 'student.demo@learnspace.ac.th';
    let mockUid = 'demo-student-user';
    let mockBio = 'นักศึกษาทดลองระบบ LearnSpace';

    if (targetRole === 'teacher') {
      mockName = 'ผศ.ดร. สมชาย มั่นคง (อาจารย์ตัวอย่าง)';
      mockEmail = 'teacher.somchai@learnspace.ac.th';
      mockUid = 'teacher-somchai';
      mockBio = 'อาจารย์ประจำภาควิชาวิทยาการคอมพิวเตอร์';
    } else if (targetRole === 'admin') {
      mockName = 'ผู้ดูแลระบบ LearnSpace';
      mockEmail = BOOTSTRAP_ADMIN_EMAIL;
      mockUid = 'admin-learnspace-root';
      mockBio = 'ผู้ดูแลระบบและสิทธิ์การจัดการ LearnSpace';
    }

    const demoFirebaseUser = {
      uid: mockUid,
      email: mockEmail,
      displayName: mockName,
      photoURL: '',
      emailVerified: true,
    } as unknown as FirebaseUser;

    const demoProfile: UserProfile = {
      uid: mockUid,
      email: mockEmail,
      displayName: mockName,
      photoURL: '',
      role: targetRole,
      bio: mockBio,
      enrolledCourses: ['course-web-dev', 'course-data-ai'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(demoFirebaseUser);
    setProfile(demoProfile);
    setSimulatedRole(null);

    try {
      localStorage.setItem(
        'learnspace_demo_session',
        JSON.stringify({ user: demoFirebaseUser, profile: demoProfile })
      );
    } catch (e) {
      console.warn('Could not persist demo session to localStorage', e);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSimulatedRole(null);
    try {
      localStorage.removeItem('learnspace_demo_session');
    } catch (e) {
      // ignore
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updated);

    if (user.uid.startsWith('demo-')) {
      return; // demo user doesn't write to firestore
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const effectiveRole: UserRole = simulatedRole || profile?.role || 'student';
  const isAdmin = effectiveRole === 'admin' || user?.email === BOOTSTRAP_ADMIN_EMAIL;
  const isTeacher = effectiveRole === 'teacher' || isAdmin;
  const isStudent = effectiveRole === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: effectiveRole,
        isAdmin,
        isTeacher,
        isStudent,
        signIn,
        signUp,
        signInWithGoogle,
        demoSignIn,
        sendPasswordReset,
        signOut,
        updateUserProfile,
        setSimulatedRole,
        simulatedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
