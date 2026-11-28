import { useCallback, useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronsUpDown,
  Minus,
} from 'lucide-react';

type ScrollZone = 'top' | 'middle' | 'bottom';

interface ScrollNavBarProps {
  /** Changes whenever view/chapter changes so scrollable height is re-measured immediately */
  watchKey: string;
}

const MIN_SCROLLABLE_PX = 280;
const MINI_STORAGE_KEY = 'chasaju:scroll-nav-mini';

function loadMiniPreference(): boolean {
  try {
    return window.localStorage.getItem(MINI_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function ScrollNavBar({ watchKey }: ScrollNavBarProps) {
  const [visible, setVisible] = useState(false);
  const [activeZone, setActiveZone] = useState<ScrollZone>('top');
  const [isMini, setIsMini] = useState<boolean>(() => loadMiniPreference());

  const toggleMini = () => {
    setIsMini((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(MINI_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage errors in restricted browsing contexts
      }
      return next;
    });
  };

  const syncScrollState = useCallback(() => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);

    if (maxScroll < MIN_SCROLLABLE_PX) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const ratio = window.scrollY / maxScroll;
    if (ratio <= 0.25) {
      setActiveZone('top');
    } else if (ratio >= 0.75) {
      setActiveZone('bottom');
    } else {
      setActiveZone('middle');
    }
  }, []);

  useEffect(() => {
    syncScrollState();
    const rafId = window.requestAnimationFrame(syncScrollState);
    const timerId = window.setTimeout(syncScrollState, 220);

    const handleScroll = () => syncScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(syncScrollState);
      observer.observe(document.body);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer?.disconnect();
    };
  }, [syncScrollState, watchKey]);

  const scrollToZone = (zone: ScrollZone) => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    const targetTop =
      zone === 'top' ? 0 : zone === 'middle' ? Math.round(maxScroll / 2) : maxScroll;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: targetTop,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  if (!visible) return null;

  const items: {
    zone: ScrollZone;
    label: string;
    ariaLabel: string;
    Icon: typeof ArrowUpToLine;
  }[] = [
    { zone: 'top', label: '맨 위', ariaLabel: '페이지 맨 위로 이동', Icon: ArrowUpToLine },
    { zone: 'middle', label: '중간', ariaLabel: '페이지 중간으로 이동', Icon: Minus },
    { zone: 'bottom', label: '맨 아래', ariaLabel: '페이지 맨 아래로 이동', Icon: ArrowDownToLine },
  ];

  if (isMini) {
    return (
      <nav
        aria-label="페이지 빠른 이동"
        className="fixed right-3 bottom-4 sm:right-6 sm:bottom-6 z-30 no-print"
      >
        <button
          type="button"
          onClick={toggleMini}
          aria-expanded={false}
          aria-label="빠른 이동 바 펼치기"
          title="빠른 이동 바 펼치기"
          className="w-[40px] h-[40px] sm:w-[42px] sm:h-[42px] inline-flex items-center justify-center bg-white/95 backdrop-blur-sm border border-[#DCDCDC] rounded-md shadow-sm text-[#595959] hover:text-[#141414] hover:border-[#141414] transition-colors cursor-pointer"
        >
          <ChevronsUpDown className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </nav>
    );
  }

  return (
    <nav
      aria-label="페이지 빠른 이동"
      className="fixed right-3 bottom-4 sm:right-6 sm:bottom-6 z-30 no-print bg-white/95 backdrop-blur-sm border border-[#DCDCDC] rounded-md shadow-sm overflow-hidden"
    >
      <div className="flex flex-col divide-y divide-[#EFEFEF]">
        {items.map(({ zone, label, ariaLabel, Icon }) => {
          const isActive = activeZone === zone;
          return (
            <button
              key={zone}
              type="button"
              onClick={() => scrollToZone(zone)}
              aria-label={ariaLabel}
              aria-current={isActive ? 'location' : undefined}
              title={ariaLabel}
              className={`w-[50px] sm:w-[54px] py-2 px-1 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#FAFAFA] text-[#141414] font-semibold'
                  : 'bg-white/95 text-[#737373] hover:text-[#141414] hover:bg-[#FAFAFA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="text-[10px] leading-tight tracking-tight whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={toggleMini}
          aria-expanded={true}
          aria-label="빠른 이동 바 접기"
          title="미니 모드로 접기"
          className="w-[50px] sm:w-[54px] py-1.5 px-1 inline-flex items-center justify-center bg-white/95 text-[#8A8A8A] hover:text-[#141414] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
