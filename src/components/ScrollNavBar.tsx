import { useCallback, useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpToLine, Minus } from 'lucide-react';

type ScrollZone = 'top' | 'middle' | 'bottom';

interface ScrollNavBarProps {
  /** Changes whenever view/chapter changes so scrollable height is re-measured immediately */
  watchKey: string;
}

const MIN_SCROLLABLE_PX = 280;

export function ScrollNavBar({ watchKey }: ScrollNavBarProps) {
  const [visible, setVisible] = useState(false);
  const [activeZone, setActiveZone] = useState<ScrollZone>('top');

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
      </div>
    </nav>
  );
}
