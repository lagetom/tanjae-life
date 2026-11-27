import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface ResetStorageButtonProps {
  onConfirmReset: () => void;
  label?: string;
  confirmPrompt?: string;
  compact?: boolean;
}

export function ResetStorageButton({
  onConfirmReset,
  label = '명부 비우기',
  confirmPrompt = '명부를 비울까요?',
  compact = false,
}: ResetStorageButtonProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 6000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  if (confirming) {
    return (
      <div
        role="group"
        aria-label="보관 명부 비우기 확인"
        className="inline-flex items-center gap-1.5"
      >
        <span className="text-xs text-[#9A3412] whitespace-nowrap">{confirmPrompt}</span>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            onConfirmReset();
          }}
          className="min-h-[40px] sm:min-h-[34px] px-3 py-1.5 text-xs font-medium text-white bg-[#9A3412] rounded-md hover:bg-[#7C2D12] transition-colors cursor-pointer whitespace-nowrap"
        >
          확인
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-[40px] sm:min-h-[34px] px-2.5 py-1.5 text-xs font-medium text-[#525252] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] hover:text-[#141414] transition-colors cursor-pointer whitespace-nowrap"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`${
        compact ? 'min-h-[40px] sm:min-h-[34px] px-3 py-1.5' : 'min-h-[44px] sm:min-h-[36px] px-3.5 py-2'
      } inline-flex items-center gap-1.5 text-xs font-medium text-[#595959] bg-white border border-[#E5E5E5] rounded-md hover:text-[#9A3412] hover:border-[#D8B4A6] transition-colors cursor-pointer whitespace-nowrap`}
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
