import { useEffect, useState } from 'react';
import { Coffee, Menu, X } from 'lucide-react';

interface TopBarProps {
  mode: 'input' | 'report' | 'relation';
  hasPersonalReport: boolean;
  activeSection: string;
  scrollProgress: number;
  onResetToInput: () => void;
  onOpenRelation: () => void;
  onReturnToReport: () => void;
  onLoadDefaultPreset: () => void;
  onNavigateSection: (id: string) => void;
  onOpenBokchae: () => void;
}

const INPUT_NAV: { id: string; label: string }[] = [
  { id: 'input-form', label: '명식 입력' },
  { id: 'ledger', label: '보관 명부' },
  { id: 'presets', label: '예시 명식' },
  { id: 'open-relation', label: '사주 관계도' },
  { id: 'seoldam-intro', label: '차사 재 소개' },
];

const REPORT_NAV: { id: string; label: string }[] = [
  { id: 'won-guk', label: '원국표' },
  { id: 'review-2026', label: '2026 결산' },
  { id: 'forecast-2027', label: '2027 신년' },
  { id: 'innate-saju', label: '타고난 5대운' },
  { id: 'astrology', label: '베딕 점성술' },
  { id: 'closing', label: '종합 처방' },
];

const RELATION_NAV: { id: string; label: string }[] = [
  { id: 'rel-members', label: '명식 등록' },
  { id: 'rel-graph', label: '관계도' },
  { id: 'rel-pair', label: '1:1 궁합' },
  { id: 'rel-group', label: '모임 오행' },
];

export function TopBar({
  mode,
  hasPersonalReport,
  activeSection,
  scrollProgress,
  onResetToInput,
  onOpenRelation,
  onReturnToReport,
  onLoadDefaultPreset,
  onNavigateSection,
  onOpenBokchae,
}: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links =
    mode === 'report' ? REPORT_NAV : mode === 'relation' ? RELATION_NAV : INPUT_NAV;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [mode]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'open-relation') {
      onOpenRelation();
      return;
    }
    onNavigateSection(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E5E5] no-print">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            if (mode === 'report') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              onResetToInput();
            }
          }}
          className="font-editorial text-base sm:text-lg font-bold tracking-tight text-[#141414] whitespace-nowrap shrink-0 cursor-pointer hover:opacity-75 transition-opacity min-h-[44px] inline-flex items-center"
        >
          차사 재(災) 명리
        </button>

        {/* Zone 2: 4–5 single-line text nav links (Desktop) */}
        <nav
          aria-label="주요 섹션 이동"
          className="hidden md:flex items-center gap-7 text-sm text-[#595959]"
        >
          {links.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'location' : undefined}
                onClick={() => handleNavClick(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b ${
                  isActive
                    ? 'text-[#141414] font-medium border-[#141414]'
                    : 'border-transparent hover:text-[#141414] hover:border-[#CCCCCC]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA action (+ mobile menu drawer toggle on < md) */}
        <div className="flex items-center gap-2 shrink-0">
          {mode === 'report' ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onResetToInput();
              }}
              className="min-h-[40px] sm:min-h-0 px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              새 사주 풀이
            </button>
          ) : mode === 'relation' ? (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (hasPersonalReport) {
                  onReturnToReport();
                } else {
                  onResetToInput();
                }
              }}
              className="min-h-[40px] sm:min-h-0 px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {hasPersonalReport ? '내 리포트 보기' : '개인 사주 풀이'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onLoadDefaultPreset();
              }}
              className="min-h-[40px] sm:min-h-0 px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              예시 리포트
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBokchae();
            }}
            className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>복채</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? '섹션 메뉴 닫기' : '섹션 메뉴 열기'}
            className="md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[#141414] border border-[#E5E5E5] rounded-md hover:border-[#141414] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Section Drawer (zero extra sticky height when closed) */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="모바일 섹션 이동"
          className="md:hidden border-t border-[#E5E5E5] bg-white px-4 py-2"
        >
          <ul className="divide-y divide-[#F0F0F0]">
            {links.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full min-h-[48px] px-2 flex items-center justify-between text-sm transition-colors cursor-pointer ${
                      isActive ? 'text-[#141414] font-semibold' : 'text-[#525252]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="text-xs text-[#6E6E6E]">현재 위치</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Editorial Reading Progress Bar (Report mode only) */}
      {mode === 'report' && (
        <div
          className="h-[2px] w-full bg-transparent overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="리포트 읽기 진행률"
        >
          <div
            className="h-full bg-[#141414] origin-left transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${Math.min(1, Math.max(0, scrollProgress / 100))})` }}
          />
        </div>
      )}
    </header>
  );
}
