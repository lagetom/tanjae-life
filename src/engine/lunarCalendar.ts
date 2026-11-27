/**
 * 1900~2050년 음력-양력 변환 테이블 (표준 동아시아 태음태양력 기준)
 * 각 20비트 정수 구조:
 * - 하위 4비트 (0x0000F): 윤달 월 (0이면 윤달 없음, 1~12)
 * - 중간 12비트 (0x0FFF0): 1월(0x8000) ~ 12월(0x0010) 대소월 (1=30일, 0=29일)
 * - 상위 4비트 (0x10000): 윤달 대소월 (1=30일, 0=29일)
 * 기준일: 양력 1900년 1월 31일 = 음력 1900년 1월 1일
 */
const LUNAR_INFO: readonly number[] = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, // 2050
];

const MIN_YEAR = 1900;
const MAX_YEAR = 2050;
const BASE_UTC_MS = Date.UTC(1900, 0, 31);
const MS_PER_DAY = 86_400_000;

export function getLunarLeapMonth(year: number): number {
  if (year < MIN_YEAR || year > MAX_YEAR) return 0;
  return LUNAR_INFO[year - MIN_YEAR] & 0xf;
}

export function getLunarLeapDays(year: number): number {
  const leapMonth = getLunarLeapMonth(year);
  if (leapMonth === 0) return 0;
  return (LUNAR_INFO[year - MIN_YEAR] & 0x10000) !== 0 ? 30 : 29;
}

export function getLunarMonthDays(year: number, month: number, isLeap = false): number {
  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12) return 29;
  if (isLeap) {
    return getLunarLeapMonth(year) === month ? getLunarLeapDays(year) : 0;
  }
  return (LUNAR_INFO[year - MIN_YEAR] & (0x10000 >> month)) !== 0 ? 30 : 29;
}

export function getLunarYearDays(year: number): number {
  if (year < MIN_YEAR || year > MAX_YEAR) return 354;
  let sum = 348;
  const info = LUNAR_INFO[year - MIN_YEAR];
  for (let mask = 0x8000; mask > 0x8; mask >>= 1) {
    sum += (info & mask) !== 0 ? 1 : 0;
  }
  return sum + getLunarLeapDays(year);
}

export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth: boolean
): { year: number; month: number; day: number } | null {
  if (lunarYear < MIN_YEAR || lunarYear > MAX_YEAR) return null;
  if (lunarMonth < 1 || lunarMonth > 12) return null;

  const leapMonth = getLunarLeapMonth(lunarYear);
  if (isLeapMonth && leapMonth !== lunarMonth) return null;

  const maxDay = getLunarMonthDays(lunarYear, lunarMonth, isLeapMonth);
  if (lunarDay < 1 || lunarDay > maxDay) return null;

  let offset = 0;
  for (let y = MIN_YEAR; y < lunarYear; y++) {
    offset += getLunarYearDays(y);
  }

  for (let m = 1; m < lunarMonth; m++) {
    offset += getLunarMonthDays(lunarYear, m, false);
    if (leapMonth === m) {
      offset += getLunarLeapDays(lunarYear);
    }
  }

  if (isLeapMonth) {
    offset += getLunarMonthDays(lunarYear, lunarMonth, false);
  }

  offset += lunarDay - 1;

  const target = new Date(BASE_UTC_MS + offset * MS_PER_DAY);
  return {
    year: target.getUTCFullYear(),
    month: target.getUTCMonth() + 1,
    day: target.getUTCDate(),
  };
}

export function solarToLunar(
  solarYear: number,
  solarMonth: number,
  solarDay: number
): { year: number; month: number; day: number; isLeap: boolean } {
  const targetMs = Date.UTC(solarYear, solarMonth - 1, solarDay);
  let offset = Math.floor((targetMs - BASE_UTC_MS) / MS_PER_DAY);

  if (offset < 0) {
    return { year: solarYear, month: solarMonth, day: solarDay, isLeap: false };
  }

  let lunarYear = MIN_YEAR;
  while (lunarYear <= MAX_YEAR) {
    const yearDays = getLunarYearDays(lunarYear);
    if (offset < yearDays) break;
    offset -= yearDays;
    lunarYear++;
  }

  const leapMonth = getLunarLeapMonth(lunarYear);
  let isLeap = false;
  let lunarMonth = 1;

  while (lunarMonth <= 12) {
    let daysInMonth: number;
    if (leapMonth > 0 && lunarMonth === leapMonth + 1 && !isLeap) {
      lunarMonth--;
      isLeap = true;
      daysInMonth = getLunarLeapDays(lunarYear);
    } else {
      daysInMonth = getLunarMonthDays(lunarYear, lunarMonth, false);
    }

    if (offset < daysInMonth) break;
    offset -= daysInMonth;

    if (isLeap && lunarMonth === leapMonth) {
      isLeap = false;
    }
    lunarMonth++;
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: offset + 1,
    isLeap,
  };
}

export function isValidSolarDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2050 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() + 1 === month &&
    d.getUTCDate() === day
  );
}
