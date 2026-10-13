import React from 'react';
import { GraduationCap, Shield, Heart, Globe, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white text-slate-500 border-t border-slate-200 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                L
              </div>
              <span className="text-lg font-bold text-[#1877F2] tracking-tight font-sans">
                LearnSpace
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              แพลตฟอร์มการเรียนรู้และชุมชนการศึกษาออนไลน์ภาษาไทย ระบบจัดการบทเรียน กิจกรรมส่งงาน และแชตสดเชื่อมต่อ Cloud Firestore
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Shield className="w-3.5 h-3.5 text-[#1877F2]" />
              <span>Cloud Firestore & Zero-Trust Security</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              หมวดหมู่การเรียนรู้
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-[#1877F2] transition-colors">
                  วิทยาการคอมพิวเตอร์และซอฟต์แวร์
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-[#1877F2] transition-colors">
                  วิทยาศาสตร์ข้อมูลและปัญญาประดิษฐ์
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-[#1877F2] transition-colors">
                  คณิตศาสตร์เชิงคำนวณและสถิติ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-[#1877F2] transition-colors">
                  คอร์สเรียนทั้งหมด
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              พื้นที่การศึกษา
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('assignments')} className="hover:text-[#1877F2] transition-colors">
                  ศูนย์กิจกรรมและส่งงาน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discussions')} className="hover:text-[#1877F2] transition-colors">
                  กระดานถาม-ตอบประจำบทเรียน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-[#1877F2] transition-colors">
                  แผงควบคุมนักเรียน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#1877F2] transition-colors">
                  ระบบผู้สอนและแอดมิน (CMS)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Standard */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              มาตรฐานและความปลอดภัย
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              ระบบจัดเก็บข้อมูลบน Google Cloud Platform พร้อมสิทธิ์การเข้าถึงข้อมูลตามบทบาท (RBAC) และการสำรองข้อมูลแบบ Realtime
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="text-[#1877F2] font-bold">LearnSpace Education Framework</span>
              <p className="mt-0.5 text-slate-500">รองรับการใช้งานบนทุกอุปกรณ์ Desktop, Tablet และ Mobile</p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 LearnSpace. สงวนลิขสิทธิ์ทุกประการ เพื่อการศึกษาและการเรียนรู้</p>
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:underline cursor-pointer">เงื่อนไขการใช้งาน</span>
            <span className="hover:underline cursor-pointer">ติดต่อผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
