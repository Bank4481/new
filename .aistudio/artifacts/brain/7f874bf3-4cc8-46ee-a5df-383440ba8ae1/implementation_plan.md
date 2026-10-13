# แผนสถาปัตยกรรมและการพัฒนาระบบ LearnSpace (Learning Management & Educational Community Platform)

แผนงานนี้จัดทำขึ้นเพื่อเป็นพิมพ์เขียว (Blueprint) ในการพัฒนาแพลตฟอร์มการเรียนรู้ **LearnSpace** ภาษาไทยสำหรับนักเรียน ครูผู้สอน และผู้ดูแลระบบ โดยใช้สถาปัตยกรรมเว็บสมัยใหม่ รองรับการใช้งานข้ามอุปกรณ์ และเน้นความปลอดภัย ความเสถียร และข้อมูลจริง

---

## สรุปการตัดสินใจร่วมกับผู้ใช้ (User Decisions & Constraints)

> [!IMPORTANT]
> สรุปข้อตกลงและตัวเลือกทางเทคนิคที่ได้รับจากการสัมภาษณ์ใน Phase 1:
> 1. **ระบบฐานข้อมูลและหลังบ้าน**: ใช้ **Firebase (Cloud Firestore, Firebase Authentication, Firebase Storage)** เป็นแกนหลักในการจัดเก็บข้อมูลและจัดการผู้ใช้
> 2. **อัตลักษณ์การออกแบบ (Visual Identity)**: สไตล์ **Academic Classic** ใช้สีกรมท่าเข้มเชิงวิชาการ (`#0F172A`, `#1E293B`) ผสานกับสีทองคำ/อำพันภูมิฐาน (`#D97706`, `#F59E0B`) และพื้นหลังสว่างสะอาดตา (`#F8FAFC`)
> 3. **ระบบพูดคุยแลกเปลี่ยน**: เน้น **กระดานกระทู้ถาม-ตอบแยกตามบทเรียน (Lesson Q&A Forum)** พร้อมระบบกระทู้ชุมชนกลาง, ป้ายแท็กหมวดหมู่, การตอบกลับ (Nested Replies) และการทำเครื่องหมายคำตอบที่ถูกต้อง

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture Overview)

LearnSpace ออกแบบตามหลักการ **Decoupled Client-Cloud Architecture** ร่วมกับ **Zero-Trust Role-Based Access Control (RBAC)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             LearnSpace Frontend                             │
│                  (React 19 + TypeScript + Tailwind CSS v4)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐  │
│  │   Public Views   │  │ Student / Teacher│  │     Admin CMS Suite       │  │
│  │ • Landing & Hero │  │ • Dashboard      │  │ • Lesson Management      │  │
│  │ • Course Catalog │  │ • Lesson Viewer  │  │ • Quiz & Task Builder     │  │
│  │ • Public Forum   │  │ • Quiz & Submit  │  │ • Submission Reviewer     │  │
│  │ • Auth (Sign/In) │  │ • Q&A Discussion │  │ • User RBAC & Audit Log   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └─────────────┬─────────────┘  │
│           │                     │                          │                │
│  ┌────────▼─────────────────────▼──────────────────────────▼─────────────┐  │
│  │               Security & State Orchestration Layer                    │  │
│  │ • AuthProvider (Firebase Auth + Verified Claims/Profile)              │  │
│  │ • RBAC Guard (Admin/Teacher/Student Role Gates & Route Guards)        │  │
│  │ • Realtime Cache & Synchronizer (Firestore Listeners / Snapshot)     │  │
│  └──────────────────────────────┬────────────────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │ HTTPS / WebSockets
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Cloud & Backend Services                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │   Firebase Auth          │  │       Cloud Firestore Database          │  │
│  │  • Email/Password        │  │ • Strict Security Rules (firestore.rules│  │
│  │  • Session Verification  │  │ • collections: users, courses, lessons, │  │
│  │  • Password Reset        │  │   quizzes, submissions, discussions     │  │
│  └──────────────────────────┘  └─────────────────────────────────────────┘  │
│  ┌──────────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │   Firebase Storage       │  │         Optional Server Proxy           │  │
│  │  • Assignment Uploads    │  │ • Express Server (SSR / File Security   │  │
│  │  • Course Media Assets   │  │   Validation / Backup Automation)       │  │
│  └──────────────────────────┘  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ผังเว็บไซต์และเส้นทาง (Sitemap & Navigation Routes)

LearnSpace แบ่งเส้นทางการเข้าถึงออกเป็น 3 โซนหลักตามสิทธิ์การใช้งาน:

```
/ (หน้าแรก - Landing Page)
│
├── /catalog (สำรวจบทเรียนและสื่อทั้งหมด)
│   ├── /catalog/:courseId (หน้ารายละเอียดคอร์ส)
│   └── /catalog/:courseId/learn/:lessonId (ห้องเรียนและเนื้อหาบทเรียน)
│
├── /auth
│   ├── /login (เข้าสู่ระบบด้วยอีเมล/รหัสผ่าน)
│   ├── /register (สมัครสมาชิกใหม่)
│   └── /forgot-password (ขอรีเซ็ตรหัสผ่าน)
│
├── /app (พื้นที่สมาชิก - ต้องล็อกอิน)
│   ├── /dashboard (แผงควบคุมการเรียนรู้, สรุปความคืบหน้า, งานรอส่ง)
│   ├── /my-courses (คอร์สที่กำลังเรียนและประวัติการเรียน)
│   ├── /assignments (รายการงานและการบ้านที่ต้องส่ง)
│   │   └── /assignments/:assignmentId (ส่งงาน แนบไฟล์ และตรวจผลประเมิน)
│   ├── /quizzes/:quizId (ระบบทำแบบทดสอบและตรวจผลคะแนน)
│   ├── /discussions (กระดานพูดคุยแลกเปลี่ยน ชุมชน และกระทู้ตามบทเรียน)
│   │   └── /discussions/:topicId (อ่านกระทู้ ตอบกลับ โหวตคำตอบมีประโยชน์)
│   ├── /notifications (ศูนย์แจ้งเตือน: ประกาศ คะแนนตรวจงาน คอมเมนต์ใหม่)
│   └── /profile (จัดการข้อมูลส่วนตัว รูปโปรไฟล์ รหัสผ่าน)
│
└── /admin (แผงควบคุมผู้ดูแลระบบและครูผู้สอน - สิทธิ์ Teacher/Admin เท่านั้น)
    ├── /admin/overview (ภาพรวมสถิติ ผู้เรียน คอร์ส การส่งงาน)
    ├── /admin/courses (จัดการคอร์ส เพิ่ม/แก้ไข/ลบ/เผยแพร่/ซ่อน)
    ├── /admin/lessons (จัดการเนื้อหาบทเรียน สื่อวิดีโอ เอกสาร)
    ├── /admin/quizzes (สร้างและแก้ไขแบบทดสอบ ตัวเลือก เกณฑ์ผ่าน)
    ├── /admin/assignments (จัดการงาน กำหนดส่ง ตรวจงาน ให้คะแนนและข้อเสนอแนะ)
    ├── /admin/moderation (ดูแลเนื้อหากระทู้ ซ่อนหรือลบข้อความที่ไม่เหมาะสม)
    ├── /admin/users (จัดการสิทธิ์สมาชิก กำหนดบทบาท Student/Teacher/Admin)
    └── /admin/settings (ตั้งค่าหน้าแรก แบนเนอร์ประชาสัมพันธ์ ธีม และการสำรองข้อมูล)
```

---

## 3. รายการหน้าจอและฟีเจอร์หลัก (Screen & Feature Inventory)

| หน้าจอ | ฟีเจอร์หลักที่ต้องทำงานได้จริง |
|---|---|
| **1. หน้าแรก (Home/Landing)** | • ส่วนต้อนรับ (Hero Banner) สไตล์วิชาการภูมิฐาน<br>• เส้นทางการเรียนรู้แนะนำ (Learning Paths)<br>• คอร์สและบทเรียนยอดนิยม/ล่าสุด<br>• สถิติความสำเร็จของแพลตฟอร์ม<br>• แถบค้นหาคอร์สและตัวกรองหมวดหมู่<br>• แบนเนอร์ประชาสัมพันธ์ที่แก้ไขได้จากหลังบ้าน |
| **2. หน้าบทเรียน (Lesson Learning)** | • ตัวเล่นเนื้อหา (Video Embed, Rich Text, Image Gallery)<br>• เอกสารประกอบดาวน์โหลดได้<br>• ตัวบอกความคืบหน้า (Progress Tracker) บันทึกสถานะเรียนจบ<br>• แถบนำทางบทก่อนหน้า-ถัดไป<br>• แท็บกระทู้ถาม-ตอบประจำบทเรียน (Q&A Tab) ถามได้ทันที |
| **3. กิจกรรมและแบบทดสอบ (Quiz Engine)** | • แบบทดสอบปรนัยหลายตัวเลือก (Multiple Choice)<br>• ตัวจับเวลาทำข้อสอบ (หากตั้งเวลาไว้)<br>• ตรวจคำตอบและคำนวณคะแนนอัตโนมัติ<br>• คำอธิบายเฉลยและเกณฑ์ผ่าน/ไม่ผ่าน<br>• บันทึกประวัติคะแนนลงฐานข้อมูล Firestore |
| **4. ส่งงานและติดตามสถานะ (Assignment Hub)** | • รายละเอียดโจทย์ วันที่เปิดรับ และกำหนดส่ง (Deadline)<br>• ฟอร์มส่งงาน: ข้อความประกอบ และการแนบไฟล์ที่รองรับ<br>• สถานะงาน 4 ขั้น: ยังไม่ส่ง (Pending), ส่งแล้วรอตรวจ (Submitted), รอแก้ไข (Needs Revision), ประเมินแล้ว (Graded)<br>• หน้าต่างตรวจงานสำหรับครู: ดาวน์โหลดไฟล์, ให้คะแนน, เขียนคำติชม |
| **5. พูดคุยแลกเปลี่ยน (Community Q&A)** | • ตั้งกระทู้คำถาม/แลกเปลี่ยน แยกตามบทเรียนหรือหมวดหมู่วิชา<br>• ตอบกลับกระทู้แบบเรียลไทม์ (Threaded Replies)<br>• ฟังก์ชัน "คำตอบที่ถูกต้อง/มีประโยชน์" (Mark as Solution)<br>• การป้องกัน XSS, ป้องกันข้อความว่างเปล่า, จำกัดความยาวข้อความ |
| **6. สมาชิกและโปรไฟล์ (Profile & Auth)** | • สมัครสมาชิก/เข้าสู่ระบบ/ออกจากระบบ ด้วย Firebase Auth<br>• กู้คืนรหัสผ่านผ่านอีเมล<br>• อัปเดตข้อมูลส่วนตัว ชีวประวัติ รูปโปรไฟล์<br>• รายการวิชาที่เรียนจบและเหรียญรางวัล/เกียรติบัตรจำลอง |
| **7. การแจ้งเตือน (Notifications)** | • แจ้งเตือนเมื่อครูตรวจงานและให้คะแนน<br>• แจ้งเตือนเมื่อมีผู้ตอบกระทู้คำถามที่ตนเองตั้ง<br>• ประกาศสำคัญจากระบบ/ผู้ดูแล |
| **8. ผู้ดูแลระบบ (Admin CMS)** | • Dashboard แสดงสถิติ: จำนวนสมาชิก บทเรียน การส่งงาน อัตราการเรียนจบ<br>• CRUD เต็มรูปแบบสำหรับ คอร์ส, บทเรียน, ข้อสอบ, การบ้าน<br>• โมดูลตรวจงานและให้คะแนน (Grading Interface)<br>• โมดูลจัดการสมาชิกและเปลี่ยน Role (Student ↔ Teacher ↔ Admin)<br>• การสำรองข้อมูล (Data Export JSON) และกู้คืนข้อมูล |

---

## 4. โครงสร้างฐานข้อมูล Firestore (Database Schema Blueprint)

ออกแบบตามแนวทาง **Normalized Root Collections** เพื่อความปลอดภัยและการเขียน Security Rules ที่มีประสิทธิภาพ:

```
Firestore Root
│
├── users/{userId}
│   ├── uid: string (ตรงกับ request.auth.uid)
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── role: "student" | "teacher" | "admin"
│   ├── bio: string
│   ├── enrolledCourses: string[] (courseId)
│   └── createdAt, updatedAt: timestamp
│
├── courses/{courseId}
│   ├── title: string
│   ├── slug: string
│   ├── description: string
│   ├── category: string
│   ├── level: "beginner" | "intermediate" | "advanced"
│   ├── coverImage: string
│   ├── instructorId: string (userId)
│   ├── instructorName: string
│   ├── published: boolean
│   ├── totalLessons: number
│   └── createdAt, updatedAt: timestamp
│
├── lessons/{lessonId}
│   ├── courseId: string
│   ├── title: string
│   ├── order: number
│   ├── summary: string
│   ├── contentHtml: string
│   ├── videoUrl: string (YouTube/Vimeo embed URL)
│   ├── attachments: [{ name: string, url: string, size: number }]
│   ├── published: boolean
│   └── createdAt, updatedAt: timestamp
│
├── quizzes/{quizId}
│   ├── courseId: string
│   ├── lessonId: string
│   ├── title: string
│   ├── passingScore: number
│   ├── questions: [
│   │     {
│   │       id: string,
│   │       prompt: string,
│   │       options: string[],
│   │       correctOptionIndex: number,
│   │       explanation: string
│   │     }
│   │   ]
│   └── createdAt, updatedAt: timestamp
│
├── quiz_attempts/{attemptId}
│   ├── quizId: string
│   ├── userId: string
│   ├── score: number
│   ├── totalScore: number
│   ├── passed: boolean
│   ├── answers: [{ questionId: string, selectedIndex: number }]
│   └── submittedAt: timestamp
│
├── assignments/{assignmentId}
│   ├── courseId: string
│   ├── lessonId: string
│   ├── title: string
│   ├── instructions: string
│   ├── dueDate: timestamp
│   ├── maxScore: number
│   ├── allowLate: boolean
│   └── createdAt, updatedAt: timestamp
│
├── submissions/{submissionId}
│   ├── assignmentId: string
│   ├── courseId: string
│   ├── studentId: string
│   ├── studentName: string
│   ├── content: string
│   ├── fileUrl: string
│   ├── fileName: string
│   ├── status: "submitted" | "graded" | "resubmit_required"
│   ├── score: number | null
│   ├── feedback: string | null
│   ├── gradedBy: string | null
│   ├── submittedAt: timestamp
│   └── gradedAt: timestamp | null
│
├── discussions/{topicId}
│   ├── courseId: string | null (null = กระทู้ทั่วไป)
│   ├── lessonId: string | null
│   ├── title: string
│   ├── content: string
│   ├── authorId: string
│   ├── authorName: string
│   ├── authorRole: string
│   ├── replyCount: number
│   ├── isSolved: boolean
│   ├── isPinned: boolean
│   └── createdAt, updatedAt: timestamp
│
├── replies/{replyId}
│   ├── topicId: string
│   ├── authorId: string
│   ├── authorName: string
│   ├── content: string
│   ├── isAcceptedAnswer: boolean
│   └── createdAt: timestamp
│
├── user_progress/{progressId} (progressId = `${userId}_${lessonId}`)
│   ├── userId: string
│   ├── courseId: string
│   ├── lessonId: string
│   ├── completed: boolean
│   └── completedAt: timestamp
│
└── site_settings/global
    ├── siteName: string ("LearnSpace")
    ├── announcementBanner: { text: string, enabled: boolean, link: string }
    ├── featuredCourses: string[]
    └── heroConfig: { title: string, subtitle: string }
```

---

## 5. ตารางสิทธิ์สมาชิกและผู้ดูแล (Role-Based Access Control - RBAC Matrix)

| หน้าที่และความสามารถ | ผู้เยี่ยมชม (Guest) | นักเรียน (Student) | ครูผู้สอน (Teacher) | ผู้ดูแลระบบ (Admin) |
|---|:---:|:---:|:---:|:---:|
| ดูหน้าแรก / แคตตาล็อกคอร์ส |  |  |  |  |
| สมัครสมาชิก / เข้าสู่ระบบ |  |  |  |  |
| เข้าเรียนบทเรียนและดูสื่อ |  |  (คอร์สที่ลงทะเบียน) |  (ทุกคอร์ส) |  (ทุกคอร์ส) |
| ทำแบบทดสอบและตรวจคะแนน | ❌ |  |  |  |
| ส่งงานและอัปโหลดไฟล์งาน | ❌ |  | ❌ (เป็นผู้ตรวจ) |  |
| ตรวจงาน ให้คะแนน และคอมเมนต์ | ❌ | ❌ |  (คอร์สของตนเอง) |  (ทุกคอร์ส) |
| ตั้งกระทู้และตอบคำถามในกระดาน | ❌ |  |  |  |
| ลบ/แก้ไขกระทู้ของผู้อื่น (Moderation) | ❌ | ❌ |  (คอร์สของตนเอง) |  |
| สร้าง / แก้ไข / ลบคอร์สและบทเรียน | ❌ | ❌ |  |  |
| จัดการสิทธิ์ผู้ใช้ (Promote Role) | ❌ | ❌ | ❌ |  |
| แก้ไขการตั้งค่าระบบและหน้าแรก | ❌ | ❌ | ❌ |  |
| สำรองและส่งออกข้อมูล (Backup Export)| ❌ | ❌ | ❌ |  |

---

## 6. รายการบริการภายนอกที่ต้องเชื่อมต่อ (External Services & Integrations)

1. **Firebase Authentication**: จัดการระบบบัญชีผู้ใช้ อีเมล รหัสผ่าน และ Session Token ที่ปลอดภัย
2. **Cloud Firestore**: ฐานข้อมูลเอกสารแบบ Realtime จัดเก็บข้อมูลคอร์ส บทเรียน งาน และผลการเรียน
3. **Firebase Storage / Object Storage**: พื้นที่จัดเก็บไฟล์งานของนักเรียน (PDF, ZIP, รูปภาพ) ป้องกันการนำไฟล์ขนาดใหญ่ไปเก็บในฐานข้อมูลโดยตรง
4. **YouTube / Vimeo Player API**: ฝังสื่อวิดีโอการสอนผ่าน iFrame หรือ Video Component พร้อมสถานะพร้อมเล่น
5. **Lucide Icons**: ชุดไอคอนสไตล์โมเดิร์นที่คมชัดและสื่อความหมายชัดเจนตามมาตรฐานวิชาการ

---

## 7. แผนการพัฒนาเป็นระยะ (Phased Implementation Roadmap)

```
[ระยะที่ 1: ติดตั้งรากฐานและระบบความปลอดภัย]
├── ขออนุมัติและตั้งค่า Firebase (Auth + Firestore + Storage)
├── สร้าง Config และ Data Types (TypeScript Interfaces)
├── ออกแบบ Theme Token (Academic Classic: Navy/Gold Palette)
└── วางระบบ Layout และ Navigation (TopBar Contract 3 โซน + Responsive Drawer)

[ระยะที่ 2: ระบบสมาชิกและการยืนยันตัวตน (Auth & User Flow)]
├── ระบบ Login / Register / Forgot Password ด้วย Firebase Auth
├── ระบบ User Profile และการจัดการบทบาท (RBAC Logic)
└── หน้า Dashboard ส่วนตัวของนักเรียน พร้อมสรุปความคืบหน้า

[ระยะที่ 3: ระบบคอร์ส บทเรียน และสื่อการสอน (Learning Engine)]
├── แคตตาล็อกบทเรียนพร้อมระบบค้นหาและตัวกรองหมวดหมู่
├── หน้าห้องเรียน (Lesson Viewer) รองรับวิดีโอ Rich Text และเอกสารแนบ
└── บันทึกความคืบหน้าการเรียน (Progress Completion Tracker)

[ระยะที่ 4: แบบทดสอบ การส่งงาน และการตรวจคะแนน (Assessment Suite)]
├── ระบบแบบทดสอบปรนัย (Quiz Engine) พร้อมจับเวลาและตรวจผล
├── ระบบส่งงานของนักเรียน (Assignment Submission with File Attachments)
└── หน้าต่างตรวจงานสำหรับครู/แอดมิน (Grading & Feedback Modal)

[ระยะที่ 5: ชุมชนและการแลกเปลี่ยน (Q&A Community)]
├── กระดานถาม-ตอบแยกตามบทเรียน (Lesson Q&A Forum)
├── การตอบกลับคอมเมนต์และการทำเครื่องหมายคำตอบที่ถูกต้อง
└── ระบบแจ้งเตือนกิจกรรมสำคัญ (Notifications)

[ระยะที่ 6: ระบบผู้ดูแลระบบและการสำรองข้อมูล (Admin CMS & Backup)]
├── Admin Dashboard สรุปสถิติและภาพรวมระบบ
├── เครื่องมือจัดการคอร์ส บทเรียน ข้อสอบ และประกาศหน้าแรก
├── ระบบจัดการสิทธิ์สมาชิก (RBAC Management)
└── ระบบส่งออกข้อมูลสำรอง (JSON Backup & Data Integrity Verification)
```

---

## 8. จุดเสี่ยงและวิธีป้องกันข้อมูลสูญหาย (Risks & Data Protection Strategy)

1. **ความเสี่ยง: การแก้ไข Role จากฝั่ง Client (Privilege Escalation)**
   - *วิธีป้องกัน*: สิทธิ์ Admin/Teacher ต้องไม่เชื่อค่าใน LocalStorage; ใน Firestore Security Rules จะไม่อนุญาตให้ผู้ใช้ทั่วไปเขียนทับฟิลด์ `role` ของตนเองได้ และการตรวจสอบสิทธิ์ในหน้า Admin จะตรวจสอบกับคอลเลกชัน `users` ในฐานข้อมูลจริงเท่านั้น
2. **ความเสี่ยง: การส่งงานซ้ำหรือบันทึกข้อมูลทับโดยไม่ตั้งใจ (Concurrent Overwrites)**
   - *วิธีป้องกัน*: มีระบบป้องกันการกดปุ่มส่งซ้ำ (Debounce/Loading Lockout) และใช้ Firestore Transactions หรือ Unique IDs (`${assignmentId}_${userId}`) เพื่อป้องกันการสร้างเอกสารซ้ำซ้อน
3. **ความเสี่ยง: การจัดเก็บไฟล์ขนาดใหญ่ทำให้ฐานข้อมูลช้าหรือค่าใช้จ่ายบวม**
   - *วิธีป้องกัน*: จำกัดประเภทไฟล์เฉพาะ PDF, DOCX, ZIP, PNG, JPG และขนาดไฟล์ไม่เกิน 15MB พร้อมระบบตรวจสอบทั้งฝั่ง Client และ Security Rules
4. **ความเสี่ยง: สแปมหรือโค้ดอันตรายในกระดานสนทนา (XSS / Injection)**
   - *วิธีป้องกัน*: ทำ Sanitize ข้อความก่อนแสดงผล ไม่ใช้ `dangerouslySetInnerHTML` กับข้อความผู้ใช้ และจำกัดความยาวกระทู้ไม่เกิน 2,000 ตัวอักษร
5. **ความเสี่ยง: ข้อมูลสูญหายจากการลบโดยไม่เจตนา (Accidental Deletion)**
   - *วิธีป้องกัน*: มีหน้าต่างยืนยันการลบ (Confirmation Dialog) ทุกครั้งก่อนลบคอร์สหรือบทเรียน พร้อมฟังก์ชัน **สำรองข้อมูลเป็นไฟล์ JSON (Export All Collections)** ในหน้า Admin Settings ที่สามารถดาวน์โหลดเก็บไว้ได้ตลอดเวลา

---

> [!NOTE]
> กรุณาตรวจสอบแผนการพัฒนานี้ หากต้องการปรับเปลี่ยนส่วนใดสามารถแจ้งได้ทันที หรือกด **Proceed** เพื่อเริ่มต้นขั้นตอนการติดตั้งระบบตามแผนงานครับ
