import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toPng } from 'html-to-image';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Images,
  Loader2,
  Share2,
  X,
} from 'lucide-react';
import { SEOLDAM_ASSETS } from '../constants/assets';
import { ELEMENT_META } from '../constants/uiMeta';
import type { ReadingReport } from '../types/saju';

interface ShareCardModalProps {
  open: boolean;
  report: ReadingReport;
  onClose: () => void;
}

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const CARD_DEFS = [
  { id: 'greeting', num: '01', label: '첫인사', fileSlug: '1_첫인사' },
  { id: 'elements', num: '02', label: '오행 균형', fileSlug: '2_오행균형' },
  { id: 'year2027', num: '03', label: '2027 정미년', fileSlug: '3_2027정미년' },
  { id: 'prescription', num: '04', label: '한 줄 처방', fileSlug: '4_한줄처방' },
] as const;

type CardId = (typeof CARD_DEFS)[number]['id'];

function extractFirstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const match = cleaned.match(/^.+?[.!?。](?=\s|$)/);
  return match ? match[0].trim() : cleaned;
}

function extractLeadingSentences(text: string, maxSentences: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const sentences = cleaned.match(/[^.!?。]+[.!?。]?/g);
  if (!sentences) return cleaned;
  return sentences
    .slice(0, maxSentences)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ');
}

function formatDirectionAndSeason(direction: string, season: string): string {
  const cleanDir = direction.trim();
  const cleanSeason = season.trim().replace(/\s+\(/g, '(');
  if (!cleanSeason) return cleanDir;
  if (!cleanDir) return cleanSeason;
  return `${cleanDir} · ${cleanSeason}`;
}

interface ShareCardCanvasProps {
  cardId: CardId;
  report: ReadingReport;
  includePersonalInfo: boolean;
}

const ShareCardCanvas = forwardRef<HTMLDivElement, ShareCardCanvasProps>(
  function ShareCardCanvas({ cardId, report, includePersonalInfo }, ref) {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [shrinkStep, setShrinkStep] = useState(0);

    const { chart, annual, closingPrescription } = report;
    const dayPillarLabel = `${chart.pillars.day.ganjiHangul}(${chart.pillars.day.ganjiHanja})일주`;
    const firstGreetingSentence = useMemo(
      () => extractFirstSentence(report.openingGreeting),
      [report.openingGreeting]
    );
    const forecastShortDesc = useMemo(
      () => extractLeadingSentences(annual.forecast2027.overviewParagraphs[0] || '', 2),
      [annual.forecast2027.overviewParagraphs]
    );
    const forecastSeoldamShort = useMemo(
      () => extractFirstSentence(annual.forecast2027.seoldamNote.quote),
      [annual.forecast2027.seoldamNote.quote]
    );

    const personalLine = useMemo(() => {
      if (!includePersonalInfo) return '';
      const solarStr = `${chart.solarDate.year}.${String(chart.solarDate.month).padStart(2, '0')}.${String(chart.solarDate.day).padStart(2, '0')}`;
      const cleanName = chart.input.name.trim();
      return cleanName ? `${cleanName} · 양력 ${solarStr}` : `양력 ${solarStr}`;
    }, [includePersonalInfo, chart.solarDate, chart.input.name]);

    const cardDef = CARD_DEFS.find((d) => d.id === cardId) ?? CARD_DEFS[0];

    // Reset shrink step whenever content changes, then step down if content overflows available height
    useLayoutEffect(() => {
      setShrinkStep(0);
    }, [cardId, report, includePersonalInfo]);

    useLayoutEffect(() => {
      const el = contentRef.current;
      if (!el) return;
      if (shrinkStep < 4 && el.scrollHeight > el.clientHeight + 2) {
        setShrinkStep((prev) => prev + 1);
      }
    }, [shrinkStep, cardId, report, includePersonalInfo]);

    // Step-down multiplier to ensure text wraps and fits cleanly inside 1080x1350 with zero clipping
    const fontScale = [1, 0.92, 0.85, 0.78, 0.72][shrinkStep] ?? 0.72;
    const fs = (px: number) => `${Math.round(px * fontScale)}px`;

    return (
      <div
        ref={ref}
        style={{
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          backgroundColor: '#FFFFFF',
          color: '#141414',
          fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '76px 84px 62px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}
      >
        {/* Top Hairline Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '26px',
            borderBottom: '1px solid #E5E5E5',
            flexShrink: 0,
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '23px',
              color: '#595959',
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {cardDef.num} · {cardDef.label}
          </div>
          {personalLine ? (
            <div
              style={{
                fontSize: '23px',
                color: '#6E6E6E',
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'right',
              }}
            >
              {personalLine}
            </div>
          ) : (
            <div
              style={{
                fontSize: '22px',
                color: '#737373',
                fontFamily: '"Gowun Batang", Georgia, serif',
              }}
            >
              {dayPillarLabel}
            </div>
          )}
        </div>

        {/* Main Card Body (Monitored for overflow so nothing ever clips outside the card) */}
        <div
          ref={contentRef}
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '36px',
            paddingBottom: '36px',
          }}
        >
          {cardId === 'greeting' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: shrinkStep >= 2 ? '250px' : '310px',
                  height: shrinkStep >= 2 ? '250px' : '310px',
                  border: '1px solid #EBEBEB',
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '44px',
                  flexShrink: 0,
                }}
              >
                <img
                  src={SEOLDAM_ASSETS.notes.calm}
                  alt="저승차사 고양이 재(災)"
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: fs(24),
                  color: '#6E6E6E',
                  marginBottom: '16px',
                  letterSpacing: '0.03em',
                }}
              >
                {chart.gyeokguk.name} · {chart.dayMaster.natureTitle}
              </div>

              <h2
                style={{
                  fontFamily: '"Gowun Batang", Georgia, serif',
                  fontSize: fs(68),
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: '#141414',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {dayPillarLabel}
              </h2>

              <p
                style={{
                  marginTop: '18px',
                  marginBottom: 0,
                  fontSize: fs(26),
                  lineHeight: 1.55,
                  color: '#525252',
                  maxWidth: '820px',
                }}
              >
                {report.dayPillarSymbol}
              </p>

              <div
                style={{
                  width: '56px',
                  height: '1px',
                  backgroundColor: '#141414',
                  margin: '44px auto',
                  flexShrink: 0,
                }}
              />

              <p
                style={{
                  fontFamily: '"Gowun Batang", Georgia, serif',
                  fontSize: fs(40),
                  lineHeight: 1.65,
                  color: '#141414',
                  margin: 0,
                  maxWidth: '860px',
                }}
              >
                “{firstGreetingSentence}”
              </p>
            </div>
          )}

          {cardId === 'elements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '42px' }}>
              <div>
                <p
                  style={{
                    fontSize: fs(24),
                    color: '#6E6E6E',
                    margin: '0 0 14px',
                  }}
                >
                  사주 원국 오행 분포
                </p>
                <h2
                  style={{
                    fontFamily: '"Gowun Batang", Georgia, serif',
                    fontSize: fs(56),
                    fontWeight: 700,
                    lineHeight: 1.24,
                    color: '#141414',
                    margin: 0,
                  }}
                >
                  {dayPillarLabel}의 오행 균형
                </h2>
              </div>

              {/* 5 Element Bars in exact on-screen ELEMENT_META colors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {chart.elementBalance.map((item) => {
                  const meta = ELEMENT_META[item.element];
                  return (
                    <div
                      key={item.element}
                      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                          <span
                            style={{
                              fontFamily: '"Gowun Batang", Georgia, serif',
                              fontSize: fs(32),
                              fontWeight: 700,
                              color: meta.color,
                            }}
                          >
                            {meta.hangul}({meta.hanja})
                          </span>
                          <span style={{ fontSize: fs(22), color: '#6E6E6E' }}>
                            {item.status}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: '"IBM Plex Mono", monospace',
                            fontSize: fs(26),
                            fontWeight: 500,
                            color: '#141414',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '18px',
                          backgroundColor: '#F2F2F2',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(item.percentage, item.percentage > 0 ? 4 : 0)}%`,
                            height: '100%',
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Strength & Yongsin hairline summary grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderTop: '1px solid #141414',
                  borderBottom: '1px solid #E5E5E5',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    padding: '30px 28px 30px 0',
                    borderRight: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(22), color: '#6E6E6E', marginBottom: '12px' }}>
                    일간 강약 (신강 · 신약)
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '14px',
                      marginBottom: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Gowun Batang", Georgia, serif',
                        fontSize: fs(42),
                        fontWeight: 700,
                        color: '#141414',
                      }}
                    >
                      {chart.strength.grade}
                    </span>
                    <span
                      style={{
                        fontFamily: '"IBM Plex Mono", monospace',
                        fontSize: fs(24),
                        color: '#595959',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {chart.strength.score}점
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: fs(22),
                      lineHeight: 1.55,
                      color: '#525252',
                      margin: 0,
                    }}
                  >
                    {extractFirstSentence(chart.strength.explanation)}
                  </p>
                </div>

                <div style={{ padding: '30px 0 30px 28px' }}>
                  <div style={{ fontSize: fs(22), color: '#6E6E6E', marginBottom: '12px' }}>
                    균형 용신 · 희신
                  </div>
                  <div
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(36),
                      fontWeight: 700,
                      color: '#141414',
                      marginBottom: '12px',
                      lineHeight: 1.3,
                    }}
                  >
                    {closingPrescription.yongsinElement}
                  </div>
                  <p
                    style={{
                      fontSize: fs(22),
                      lineHeight: 1.55,
                      color: '#525252',
                      margin: 0,
                    }}
                  >
                    {extractFirstSentence(chart.yongsin.reason)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {cardId === 'year2027' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div>
                <p
                  style={{
                    fontSize: fs(24),
                    color: '#6E6E6E',
                    margin: '0 0 16px',
                  }}
                >
                  2027 정미(丁未)년 신년 흐름 · {annual.forecast2027.pillar.stemTenGod}·
                  {annual.forecast2027.pillar.branchTenGod}
                </p>
                <h2
                  style={{
                    fontFamily: '"Gowun Batang", Georgia, serif',
                    fontSize: fs(58),
                    fontWeight: 700,
                    lineHeight: 1.32,
                    color: '#141414',
                    margin: 0,
                  }}
                >
                  {annual.forecast2027.headline}
                </h2>
              </div>

              <div
                style={{
                  width: '72px',
                  height: '1px',
                  backgroundColor: '#141414',
                  flexShrink: 0,
                }}
              />

              <p
                style={{
                  fontSize: fs(31),
                  lineHeight: 1.75,
                  color: '#262626',
                  margin: 0,
                }}
              >
                {forecastShortDesc}
              </p>

              {/* Peak & Care Months strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderTop: '1px solid #E5E5E5',
                  borderBottom: '1px solid #E5E5E5',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    padding: '28px 24px 28px 0',
                    borderRight: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    흐름이 열리는 달
                  </div>
                  <div
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(32),
                      fontWeight: 700,
                      color: '#141414',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {annual.forecast2027.peakMonths.length > 0
                      ? annual.forecast2027.peakMonths.map((m) => `${m}월`).join(' · ')
                      : '고른 흐름'}
                  </div>
                </div>
                <div style={{ padding: '28px 0 28px 24px' }}>
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    숨 고르며 살필 달
                  </div>
                  <div
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(32),
                      fontWeight: 700,
                      color: '#141414',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {annual.forecast2027.careMonths.length > 0
                      ? annual.forecast2027.careMonths.map((m) => `${m}월`).join(' · ')
                      : '무난한 리듬'}
                  </div>
                </div>
              </div>

              {forecastSeoldamShort && (
                <div
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E5E5E5',
                    padding: '28px 32px',
                  }}
                >
                  <div style={{ fontSize: fs(20), color: '#6E6E6E', marginBottom: '10px' }}>
                    저승차사 재(災)의 여백 메모
                  </div>
                  <p
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(27),
                      lineHeight: 1.65,
                      color: '#262626',
                      margin: 0,
                    }}
                  >
                    “{forecastSeoldamShort}”
                  </p>
                </div>
              )}
            </div>
          )}

          {cardId === 'prescription' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '38px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                <div
                  style={{
                    width: shrinkStep >= 2 ? '110px' : '136px',
                    height: shrinkStep >= 2 ? '110px' : '136px',
                    border: '1px solid #EBEBEB',
                    backgroundColor: '#FFFFFF',
                    padding: '10px',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={SEOLDAM_ASSETS.notes.warm}
                    alt="부채를 든 저승차사 고양이 재(災)"
                    crossOrigin="anonymous"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: fs(23), color: '#6E6E6E', margin: '0 0 10px' }}>
                    저승차사 재(災)의 양생 처방
                  </p>
                  <h2
                    style={{
                      fontFamily: '"Gowun Batang", Georgia, serif',
                      fontSize: fs(48),
                      fontWeight: 700,
                      lineHeight: 1.25,
                      color: '#141414',
                      margin: 0,
                    }}
                  >
                    2027 한 줄 처방
                  </h2>
                </div>
              </div>

              <p
                style={{
                  fontFamily: '"Gowun Batang", Georgia, serif',
                  fontSize: fs(42),
                  lineHeight: 1.62,
                  color: '#141414',
                  margin: 0,
                  paddingTop: '28px',
                  paddingBottom: '28px',
                  borderTop: '1px solid #141414',
                  borderBottom: '1px solid #E5E5E5',
                }}
              >
                “{closingPrescription.oneLiner}”
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  borderTop: '1px solid #E5E5E5',
                  borderLeft: '1px solid #E5E5E5',
                }}
              >
                <div
                  style={{
                    padding: '28px 30px',
                    borderRight: '1px solid #E5E5E5',
                    borderBottom: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    용신
                  </div>
                  <div
                    style={{
                      fontSize: fs(28),
                      fontWeight: 600,
                      color: '#141414',
                      lineHeight: 1.45,
                    }}
                  >
                    {closingPrescription.yongsinElement}
                  </div>
                </div>

                <div
                  style={{
                    padding: '28px 30px',
                    borderRight: '1px solid #E5E5E5',
                    borderBottom: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    행운 색
                  </div>
                  <div
                    style={{
                      fontSize: fs(28),
                      fontWeight: 600,
                      color: '#141414',
                      lineHeight: 1.45,
                    }}
                  >
                    {closingPrescription.favorableColor}
                  </div>
                </div>

                <div
                  style={{
                    padding: '28px 30px',
                    borderRight: '1px solid #E5E5E5',
                    borderBottom: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    방향
                  </div>
                  <div
                    style={{
                      fontSize: fs(28),
                      fontWeight: 600,
                      color: '#141414',
                      lineHeight: 1.45,
                    }}
                  >
                    {formatDirectionAndSeason(
                      closingPrescription.favorableDirection,
                      closingPrescription.favorableSeason
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '28px 30px',
                    borderRight: '1px solid #E5E5E5',
                    borderBottom: '1px solid #E5E5E5',
                  }}
                >
                  <div style={{ fontSize: fs(21), color: '#6E6E6E', marginBottom: '10px' }}>
                    습관
                  </div>
                  <div
                    style={{
                      fontSize: fs(24),
                      fontWeight: 500,
                      color: '#262626',
                      lineHeight: 1.55,
                    }}
                  >
                    {closingPrescription.dailyRitual}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory Common Bottom Brand Line (Cannot be disabled) */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <img
            src="/favicon.svg"
            alt=""
            width={28}
            height={28}
            crossOrigin="anonymous"
            style={{ width: '28px', height: '28px', display: 'block', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: '23px',
              color: '#6E6E6E',
              letterSpacing: '0.01em',
            }}
          >
            차사 재(災) 명리 · chasaju.web.app
          </span>
        </div>
      </div>
    );
  }
);

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(',');
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function waitForNodeAssets(node: HTMLElement): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    })
  );
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

export function ShareCardModal({ open, report, onClose }: ShareCardModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [busyMode, setBusyMode] = useState<null | 'single' | 'all' | 'share'>(null);
  const [busyProgress, setBusyProgress] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [previewWidth, setPreviewWidth] = useState(360);

  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const touchStartX = useRef<number | null>(null);

  const dayPillarHangul = report.chart.pillars.day.ganjiHangul;

  useEffect(() => {
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function'
      ) {
        const probeFile = new File([new Uint8Array([0])], 'probe.png', {
          type: 'image/png',
        });
        setCanShareFiles(navigator.canShare({ files: [probeFile] }));
      } else {
        setCanShareFiles(false);
      }
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setStatusMessage('');
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev < CARD_DEFS.length - 1 ? prev + 1 : prev));
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = previewFrameRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setPreviewWidth(rect.width);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  const getCardFilename = useCallback(
    (idx: number) => {
      const def = CARD_DEFS[idx] ?? CARD_DEFS[0];
      return `차사재명리_${dayPillarHangul}일주_${def.fileSlug}.png`;
    },
    [dayPillarHangul]
  );

  const renderCardToPngDataUrl = useCallback(async (idx: number): Promise<string> => {
    const node = exportRefs.current[idx];
    if (!node) {
      throw new Error('카드를 준비하는 중입니다. 잠시 후 다시 시도해 주세요.');
    }
    await waitForNodeAssets(node);
    return toPng(node, {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      pixelRatio: 1,
      backgroundColor: '#FFFFFF',
      cacheBust: true,
    });
  }, []);

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCurrent = async () => {
    if (busyMode) return;
    setBusyMode('single');
    setStatusMessage('');
    try {
      const dataUrl = await renderCardToPngDataUrl(activeIndex);
      const filename = getCardFilename(activeIndex);
      triggerDownload(dataUrl, filename);
      setStatusMessage(`${CARD_DEFS[activeIndex].num}번 카드를 저장했습니다.`);
    } catch {
      setStatusMessage('이미지 생성 중 잠시 문제가 생겼습니다. 다시 시도해 주세요.');
    } finally {
      setBusyMode(null);
    }
  };

  const handleDownloadAll = async () => {
    if (busyMode) return;
    setBusyMode('all');
    setStatusMessage('');
    try {
      for (let i = 0; i < CARD_DEFS.length; i += 1) {
        setBusyProgress(`${i + 1}/${CARD_DEFS.length}`);
        const dataUrl = await renderCardToPngDataUrl(i);
        triggerDownload(dataUrl, getCardFilename(i));
        if (i < CARD_DEFS.length - 1) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, 260));
        }
      }
      setStatusMessage('4장의 공유 카드를 모두 저장했습니다.');
    } catch {
      setStatusMessage('이미지 저장 중 일부가 중단되었습니다. 다시 시도해 주세요.');
    } finally {
      setBusyMode(null);
      setBusyProgress('');
    }
  };

  const handleWebShare = async () => {
    if (busyMode || !canShareFiles) return;
    setBusyMode('share');
    setStatusMessage('');
    try {
      const dataUrl = await renderCardToPngDataUrl(activeIndex);
      const filename = getCardFilename(activeIndex);
      const blob = dataUrlToBlob(dataUrl);
      const file = new File([blob], filename, { type: 'image/png' });
      if (!navigator.canShare({ files: [file] })) {
        triggerDownload(dataUrl, filename);
        setStatusMessage('공유 창을 지원하지 않아 이미지 파일로 저장했습니다.');
        return;
      }
      await navigator.share({
        files: [file],
        title: `차사 재(災) 명리 · ${dayPillarHangul}일주`,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setStatusMessage('공유 중 문제가 발생했습니다. 이미지 저장을 이용해 주세요.');
    } finally {
      setBusyMode(null);
    }
  };

  if (!open) return null;

  const activeDef = CARD_DEFS[activeIndex];
  const previewScale = previewWidth / CARD_WIDTH;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5 no-print"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-card-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[94vh] overflow-y-auto bg-white border border-[#141414] p-5 sm:p-7 shadow-xl"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EFEFEF]">
          <div>
            <p className="text-xs text-[#6E6E6E] tabular-nums">
              결과 공유 카드 · 1080×1350 (4:5)
            </p>
            <h2
              id="share-card-modal-title"
              className="mt-0.5 font-editorial text-lg sm:text-xl font-bold text-[#141414]"
            >
              {report.chart.pillars.day.ganjiHangul}({report.chart.pillars.day.ganjiHanja})일주
              카드 저장 · 공유
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="공유 카드 창 닫기"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 inline-flex items-center justify-center text-[#6E6E6E] hover:text-[#141414] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Selector Tabs (4 Cards) */}
        <div
          role="tablist"
          aria-label="공유 카드 4장 선택"
          className="mt-4 grid grid-cols-4 border-t border-l border-[#E5E5E5]"
        >
          {CARD_DEFS.map((card, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveIndex(idx)}
                className={`min-h-[44px] px-2 py-2 text-center border-r border-b border-[#E5E5E5] transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#141414] text-white'
                    : 'bg-white text-[#595959] hover:bg-[#FAFAFA] hover:text-[#141414]'
                }`}
              >
                <span
                  className={`block font-mono text-[10px] tabular-nums ${
                    isSelected ? 'text-[#D4D4D4]' : 'text-[#737373]'
                  }`}
                >
                  {card.num}
                </span>
                <span className="block text-[11px] sm:text-xs font-medium truncate">
                  {card.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live 4:5 Scaled Preview Carousel */}
        <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeIndex === 0}
            aria-label="이전 카드 보기"
            className="min-h-[40px] min-w-[36px] sm:min-w-[40px] inline-flex items-center justify-center border border-[#E5E5E5] bg-white text-[#141414] rounded-md hover:border-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={previewFrameRef}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
              const diff = touchStartX.current - endX;
              touchStartX.current = null;
              if (Math.abs(diff) < 40) return;
              if (diff > 0 && activeIndex < CARD_DEFS.length - 1) {
                setActiveIndex((prev) => prev + 1);
              } else if (diff < 0 && activeIndex > 0) {
                setActiveIndex((prev) => prev - 1);
              }
            }}
            className="w-full max-w-[340px] sm:max-w-[360px] aspect-[4/5] border border-[#E5E5E5] bg-white overflow-hidden relative select-none"
          >
            <div
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            >
              <ShareCardCanvas
                cardId={activeDef.id}
                report={report}
                includePersonalInfo={includePersonalInfo}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => Math.min(CARD_DEFS.length - 1, prev + 1))
            }
            disabled={activeIndex === CARD_DEFS.length - 1}
            aria-label="다음 카드 보기"
            className="min-h-[40px] min-w-[36px] sm:min-w-[40px] inline-flex items-center justify-center border border-[#E5E5E5] bg-white text-[#141414] rounded-md hover:border-[#141414] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Toggle Row */}
        <div className="mt-4 py-3 border-y border-[#EFEFEF] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span id="share-privacy-label" className="text-xs font-medium text-[#141414]">
              이름·생년월일 넣기
            </span>
            <p className="text-[11px] text-[#6E6E6E]">
              기본으로 꺼져 있으며, 켤 때만 카드 상단에 표시됩니다.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={includePersonalInfo}
            aria-labelledby="share-privacy-label"
            onClick={() => setIncludePersonalInfo((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
              includePersonalInfo ? 'bg-[#141414]' : 'bg-[#D4D4D4]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includePersonalInfo ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Export & Share Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {canShareFiles && (
            <button
              type="button"
              disabled={busyMode !== null}
              onClick={handleWebShare}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#141414] rounded-md hover:bg-[#2E2E2E] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {busyMode === 'share' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{busyMode === 'share' ? '준비 중…' : '공유하기'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={busyMode !== null}
            onClick={handleDownloadCurrent}
            className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-md disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap ${
              canShareFiles
                ? 'text-[#141414] bg-white border border-[#141414] hover:bg-[#141414] hover:text-white'
                : 'text-white bg-[#141414] hover:bg-[#2E2E2E]'
            }`}
          >
            {busyMode === 'single' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{busyMode === 'single' ? '저장 중…' : '이미지 저장'}</span>
          </button>

          <button
            type="button"
            disabled={busyMode !== null}
            onClick={handleDownloadAll}
            className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#141414] bg-white border border-[#D4D4D4] rounded-md hover:border-[#141414] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            {busyMode === 'all' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Images className="w-3.5 h-3.5" />
            )}
            <span>
              {busyMode === 'all' ? `저장 중 (${busyProgress})` : '4장 모두 저장'}
            </span>
          </button>
        </div>

        {statusMessage && (
          <p
            aria-live="polite"
            className="mt-3 text-center text-xs text-[#595959]"
          >
            {statusMessage}
          </p>
        )}
      </div>

      {/* Off-screen Full-Resolution 1080x1350px Cards for Crisp PNG Export */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          pointerEvents: 'none',
          opacity: 1,
          zIndex: -1,
        }}
      >
        {CARD_DEFS.map((card, idx) => (
          <ShareCardCanvas
            key={card.id}
            ref={(el) => {
              exportRefs.current[idx] = el;
            }}
            cardId={card.id}
            report={report}
            includePersonalInfo={includePersonalInfo}
          />
        ))}
      </div>
    </div>
  );
}
