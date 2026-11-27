import type { ElementType, PresetProfile, VedicElement } from '../types/saju';

export const ELEMENT_META: Record<
  ElementType,
  { hangul: string; hanja: string; color: string; bgTint: string; borderTint: string }
> = {
  wood: {
    hangul: '목',
    hanja: '木',
    color: '#14532D',
    bgTint: '#F2F7F4',
    borderTint: '#C7DCD0',
  },
  fire: {
    hangul: '화',
    hanja: '火',
    color: '#9A3412',
    bgTint: '#FDF5F2',
    borderTint: '#E9CEC3',
  },
  earth: {
    hangul: '토',
    hanja: '土',
    color: '#854D0E',
    bgTint: '#FBF8F1',
    borderTint: '#E5D8BF',
  },
  metal: {
    hangul: '금',
    hanja: '金',
    color: '#475569',
    bgTint: '#F6F7F9',
    borderTint: '#D4DAE2',
  },
  water: {
    hangul: '수',
    hanja: '水',
    color: '#1E3A8A',
    bgTint: '#F2F5FB',
    borderTint: '#C9D5EC',
  },
};

export const ELEMENT_ORDER: ElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export const VEDIC_ELEMENT_META: Record<
  VedicElement,
  { nameKo: string; sanskrit: string; color: string }
> = {
  fire: { nameKo: '불(Agni)', sanskrit: '아그니', color: '#9A3412' },
  earth: { nameKo: '흙(Prithvi)', sanskrit: '프리트비', color: '#854D0E' },
  air: { nameKo: '바람(Vayu)', sanskrit: '바유', color: '#475569' },
  water: { nameKo: '물(Jala)', sanskrit: '잘라', color: '#1E3A8A' },
};

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'preset-kim-bom',
    label: '김봄 · 병술(丙戌)일주',
    caption: '1971.01.01 양력 · 10:30 · 계병무경사술자술',
    input: {
      name: '김봄',
      gender: 'female',
      calendarType: 'solar',
      year: 1971,
      month: 1,
      day: 1,
      isLeapMonth: false,
      hour: 10,
      minute: 30,
      unknownTime: false,
      useTrueSolarTime: true,
    },
  },
  {
    id: 'preset-lee-yeoreum',
    label: '이여름 · 을유(乙酉)일주',
    caption: '1992.03.10 양력 · 10:30 · 신을계임사유묘신',
    input: {
      name: '이여름',
      gender: 'male',
      calendarType: 'solar',
      year: 1992,
      month: 3,
      day: 10,
      isLeapMonth: false,
      hour: 10,
      minute: 30,
      unknownTime: false,
      useTrueSolarTime: true,
    },
  },
  {
    id: 'preset-park-gaeul',
    label: '박가을 · 무오(戊午)일주',
    caption: '2000.01.01 양력 · 10:30 · 정무병기사오자묘',
    input: {
      name: '박가을',
      gender: 'female',
      calendarType: 'solar',
      year: 2000,
      month: 1,
      day: 1,
      isLeapMonth: false,
      hour: 10,
      minute: 30,
      unknownTime: false,
      useTrueSolarTime: true,
    },
  },
  {
    id: 'preset-choi-gyeoul',
    label: '최겨울 · 정축(丁丑)일주',
    caption: '2007.10.10 양력 · 10:30 · 을정경정사축술해',
    input: {
      name: '최겨울',
      gender: 'male',
      calendarType: 'solar',
      year: 2007,
      month: 10,
      day: 10,
      isLeapMonth: false,
      hour: 10,
      minute: 30,
      unknownTime: false,
      useTrueSolarTime: true,
    },
  },
];

export const SAMPLE_RELATION_BATCH_TEXT = `김봄 계병무경사술자술
이여름 신을계임사유묘신
박가을 정무병기사오자묘
최겨울 을정경정사축술해`;

export function getPairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}__${idB}` : `${idB}__${idA}`;
}
