import { useEffect } from 'react';
import { Coffee, ExternalLink, X } from 'lucide-react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { BOKCHAE_CONFIG } from '../constants/bokchae';
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

  const hasCoupangUrl = Boolean(BOKCHAE_CONFIG.coupangUrl);

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
        className="w-full max-w-md bg-white border border-[#141414] p-6 sm:p-7 shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFEFEF]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 overflow-hidden bg-white border border-[#EFEFEF] p-1">
              <SeoldamImage
                src={SEOLDAM_ASSETS.notes.warm}
                alt="부채를 든 저승차사 고양이 재(災)"
                className="w-full h-full object-contain"
                fallbackTitle="재(災)"
              />
            </div>
            <div>
              <p className="text-xs text-[#6E6E6E] inline-flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-[#141414]" />
                <span>복채 · 저승차사 재(災) 찻값</span>
              </p>
              <h2
                id="bokchae-modal-title"
                className="mt-0.5 font-editorial text-lg font-bold text-[#141414] leading-snug"
              >
                {BOKCHAE_CONFIG.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="복채 안내 창 닫기"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#6E6E6E] hover:text-[#141414] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5">
          <p className="font-editorial text-[15px] leading-[1.82] text-[#262626]">
            “{BOKCHAE_CONFIG.quote}”
          </p>

          <div className="mt-6">
            {hasCoupangUrl ? (
              <a
                href={BOKCHAE_CONFIG.coupangUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] transition-colors"
              >
                <span>{BOKCHAE_CONFIG.ctaLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="border border-dashed border-[#D4D4D4] bg-[#FAFAFA] p-4 text-center">
                <p className="text-xs font-semibold text-[#141414]">
                  쿠팡 파트너스 링크 연결 자리 (준비 중)
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#595959]">
                  쿠팡 파트너스 주소를 연결하면 이곳에 바로 이동 버튼이 활성화됩니다.
                </p>
              </div>
            )}
          </div>

          {/* Mandatory FTC Disclosure & Reference Disclaimer */}
          <div className="mt-5 pt-4 border-t border-[#EFEFEF] space-y-1.5 text-[11px] leading-relaxed text-[#595959]">
            <p>{BOKCHAE_CONFIG.ftcNotice}</p>
            <p className="text-[#6E6E6E]">{BOKCHAE_CONFIG.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
