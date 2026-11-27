import { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SeoldamImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SeoldamImage({
  src,
  alt,
  className = '',
  fallbackTitle = '재(災)',
}: SeoldamImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#FAFAFA] border border-[#E5E5E5] text-[#666666] p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <BookOpen className="w-6 h-6 stroke-[1.25] mb-2 text-[#141414]" />
        <span className="font-editorial text-sm text-[#141414]">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
