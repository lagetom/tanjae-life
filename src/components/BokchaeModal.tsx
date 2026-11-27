import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { BOKCHAE_CONFIG, BOKCHAE_ITEMS } from '../constants/bokchae';
import { SeoldamImage } from './SeoldamImage';

interface BokchaeModalProps {
  open: boolean;
  onClose: () => void;
}

export function BokchaeModal({ open, onClose }: BokchaeModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 no-print"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bokchae-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-[#141414] p-6 sm:p-8 shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#EFEFEF]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 overflow-hidden bg-[#FAFAFA] p-1">
              <SeoldamImage
                src={SEOLDAM_ASSETS.notes.warm}
                alt="부채를 든 저승차사 고양이 재(災)"
                className="w-full h-full object-contain"
                fallbackTitle="재(災)"
              />
            </div>
            <div>
              <p className="text-xs text-[#6E6E6E]">
                {BOKCHAE_CONFIG.kicker}
              </p>
              <h2
                id="bokchae-modal-title"
                className="mt-0.5 font-editorial text-lg sm:text-xl font-bold text-[#141414] leading-snug text-balance"
              >
                {BOKCHAE_CONFIG.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="복채 안내 창 닫기"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#6E6E6E] hover:text-[#141414] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro Quote */}
        <p className="mt-5 font-editorial text-[14.5px] leading-[1.78] text-[#262626]">
          {BOKCHAE_CONFIG.quote}
        </p>

        {/* Curated 2027 Items List (Hairline-divided editorial rows, zero nested card boxes) */}
        <div className="mt-5 divide-y divide-[#EFEFEF] border-y border-[#EFEFEF]">
          {BOKCHAE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
            >
              <div className="min-w-0">
                <p className="text-xs text-[#6E6E6E] tabular-nums">
                  <span>{item.indexLabel}</span>
                  <span aria-hidden="true" className="mx-1.5">·</span>
                  <span>{item.category}</span>
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-[#141414] leading-snug">
                  {item.name}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#595959]">
                  {item.description}
                </p>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="self-start sm:self-center min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#141414] hover:bg-[#2E2E2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>{BOKCHAE_CONFIG.itemCtaLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Mandatory FTC Disclosure & Reference Disclaimer */}
        <div className="mt-5 space-y-1 text-[11.5px] leading-relaxed">
          <p className="font-medium text-[#404040]">{BOKCHAE_CONFIG.ftcNotice}</p>
          <p className="text-[#6E6E6E]">{BOKCHAE_CONFIG.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
