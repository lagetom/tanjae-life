import { useState } from 'react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { ChapterId, ReportChapter } from '../engine/sajuTypes';
import { SeoldamImage } from './SeoldamImage';

interface InnateChaptersTabsProps {
  chapters: ReportChapter[];
}

export function InnateChaptersTabs({ chapters }: InnateChaptersTabsProps) {
  const [activeTab, setActiveTab] = useState<ChapterId>('personality');
  const activeChapter = chapters.find((c) => c.id === activeTab) ?? chapters[0];
  const noteImageSrc = SEOLDAM_ASSETS.notes[activeChapter.seoldamNote.mood];

  return (
    <section
      id="innate-saju"
      aria-labelledby="innate-saju-heading"
      className="py-16 border-t border-[#E5E5E5] scroll-mt-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-[#666666] mb-1.5">03. 평생 원국 기질 바탕</p>
          <h2
            id="innate-saju-heading"
            className="font-editorial text-2xl sm:text-3xl font-bold text-[#141414]"
          >
            타고난 5대 영역 상세 풀이
          </h2>
        </div>

        {/* Clean Segmented Tab Control */}
        <div
          role="tablist"
          aria-label="타고난 5대 영역 선택"
          className="inline-flex items-center gap-1 p-1 bg-[#F5F5F5] rounded-md overflow-x-auto no-print"
        >
          {chapters.map((ch) => {
            const isActive = ch.id === activeChapter.id;
            const shortLabel = ch.title.split(' ')[0];
            return (
              <button
                key={ch.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(ch.id)}
                className={`min-h-[40px] px-3.5 py-2 text-xs rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-[#141414] font-medium shadow-xs'
                    : 'text-[#595959] hover:text-[#141414]'
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Chapter Asymmetric 70/30 Content */}
      <div
        role="tabpanel"
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
      >
        <div className="lg:col-span-8 max-w-2xl">
          <p className="text-sm text-[#666666]">{activeChapter.subtitle}</p>
          <p className="mt-3 pb-5 border-b border-[#EFEFEF] text-xs text-[#737373] tabular-nums">
            명리 근거 · {activeChapter.evidenceLine}
          </p>

          <h3 className="mt-6 font-editorial text-xl sm:text-[1.35rem] font-bold leading-snug text-[#141414] text-balance">
            {activeChapter.headline}
          </h3>

          <div className="mt-5 space-y-5 text-[15.5px] leading-[1.88] text-[#262626]">
            {activeChapter.paragraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <dl className="mt-8 border-t border-b border-[#E5E5E5] divide-y divide-[#EFEFEF]">
            {activeChapter.keyPoints.map((kp) => (
              <div
                key={kp.label}
                className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4"
              >
                <dt className="sm:col-span-4 text-xs font-semibold text-[#141414] pt-0.5">
                  {kp.label}
                </dt>
                <dd className="sm:col-span-8 text-sm leading-relaxed text-[#404040]">
                  {kp.content}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside
          aria-label={activeChapter.seoldamNote.tag}
          className="lg:col-span-4 lg:sticky lg:top-24"
        >
          <div className="border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F0F0F0]">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-white">
                <SeoldamImage
                  src={noteImageSrc}
                  alt="저승차사 고양이 재(災)의 여백 노트 삽화"
                  className="w-full h-full object-contain"
                  fallbackTitle="재(災)"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#141414]">
                  {activeChapter.seoldamNote.tag}
                </p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  저승차사 재(災)
                </p>
              </div>
            </div>

            <blockquote className="mt-5 font-editorial text-[15px] leading-[1.82] text-[#262626]">
              “{activeChapter.seoldamNote.quote}”
            </blockquote>

            <p className="mt-5 pt-4 border-t border-[#F0F0F0] text-[11px] leading-relaxed text-[#737373] tabular-nums">
              주석 · {activeChapter.seoldamNote.footnote}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
