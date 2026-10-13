import React from 'react';
import { GraduationCap, Shield, Heart, Globe, BookOpen } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Learn<span className="text-amber-400">Space</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              แพลตฟอร์มการเรียนรู้และชุมชนการศึกษาออนไลน์ภาษาไทย มุ่งมั่นยกระดับประสบการณ์การเรียนการสอนด้วยเทคโนโลยีที่มั่นคงและปลอดภัย
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Cloud Firestore & Zero-Trust Security</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              หมวดหมู่การเรียนรู้
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-amber-400 transition-colors">
                  วิทยาการคอมพิวเตอร์และซอฟต์แวร์
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-amber-400 transition-colors">
                  วิทยาศาสตร์ข้อมูลและปัญญาประดิษฐ์
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-amber-400 transition-colors">
                  คณิตศาสตร์เชิงคำนวณและสถิติ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('courses')} className="hover:text-amber-400 transition-colors">
                  คอร์สเรียนทั้งหมด
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              พื้นที่การศึกษา
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('assignments')} className="hover:text-amber-400 transition-colors">
                  ศูนย์กิจกรรมและส่งงาน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discussions')} className="hover:text-amber-400 transition-colors">
                  กระดานถาม-ตอบประจำบทเรียน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-amber-400 transition-colors">
                  แผงควบคุมนักเรียน
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-amber-400 transition-colors">
                  ระบบผู้สอนและแอดมิน (CMS)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Standard */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              มาตรฐานและความปลอดภัย
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              ระบบจัดเก็บข้อมูลบน Google Cloud Platform พร้อมสิทธิ์การเข้าถึงข้อมูลตามบทบาท (RBAC) และการสำรองข้อมูลเป็นระยะ
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">LearnSpace Academic Standard</span>
              <p className="mt-0.5 text-slate-500">รองรับการใช้งานบนทุกอุปกรณ์ Desktop, Tablet และ Mobile</p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 LearnSpace. สงวนลิขสิทธิ์ทุกประการ เพื่อการศึกษาและการเรียนรู้</p>
          <div className="flex items-center gap-6">
            <span>นโยบายความเป็นส่วนตัว</span>
            <span>เงื่อนไขการใช้งาน</span>
            <span>ติดต่อผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
