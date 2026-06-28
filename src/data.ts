import { CategoryInfo } from './types';
import { ABILITY_ITEMS } from './data/ability';
import { APPEARANCE_ITEMS } from './data/appearance';
import { OUTFIT_ITEMS } from './data/outfit';
import { EMOTICON_ITEMS } from './data/emoticon';
import { COLOR_ITEMS } from './data/color';
import { PERSONALITY_ITEMS } from './data/personality';
import { THEME_ITEMS } from './data/theme';
import { ITEM_ITEMS } from './data/item';
import { NAME_ITEMS } from './data/name';

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: 'name',
    name: '이름',
    englishName: 'Name',
    description: '캐릭터의 고유한 서양, 일본, 한국식 가상 이름',
    icon: 'UserCheck',
    defaultCount: 1,
    maxCount: 1,
    items: NAME_ITEMS
  },
  {
    id: 'personality',
    name: '성격',
    englishName: 'Personality',
    description: '캐릭터가 지닌 내적 특성이나 행동 성향',
    icon: 'Heart',
    defaultCount: 1,
    maxCount: 3,
    items: PERSONALITY_ITEMS
  },
  {
    id: 'theme',
    name: '콘셉트',
    englishName: 'Concept',
    description: '캐릭터의 배경 세계관이나 메인 직업 콘셉트',
    icon: 'Compass',
    defaultCount: 1,
    maxCount: 2,
    items: THEME_ITEMS
  },
  {
    id: 'ability',
    name: '능력',
    englishName: 'Ability',
    description: '캐릭터가 다루는 특별한 힘이나 능력치',
    icon: 'Sparkles',
    defaultCount: 1,
    maxCount: 3,
    items: ABILITY_ITEMS
  },
  {
    id: 'appearance',
    name: '외모',
    englishName: 'Appearance',
    description: '외형적 특징, 헤어스타일 및 신체 특징',
    icon: 'User',
    defaultCount: 1,
    maxCount: 4,
    items: APPEARANCE_ITEMS
  },
  {
    id: 'outfit',
    name: '의상/복장',
    englishName: 'Outfit',
    description: '캐릭터가 입고 있는 옷, 신발 및 주요 복장 스타일',
    icon: 'Shirt',
    defaultCount: 1,
    maxCount: 3,
    items: OUTFIT_ITEMS
  },
  {
    id: 'item',
    name: '소품',
    englishName: 'Props',
    description: '휴대 도구, 장신구 및 특수 연출용 소품 요소',
    icon: 'Gem',
    defaultCount: 1,
    maxCount: 3,
    items: ITEM_ITEMS
  },
  {
    id: 'emoticon',
    name: '이모티콘',
    englishName: 'Emoticon',
    description: '캐릭터의 상징이나 테마를 드러내는 아이콘',
    icon: 'Smile',
    defaultCount: 1,
    maxCount: 4,
    items: EMOTICON_ITEMS
  },
  {
    id: 'color',
    name: '색깔',
    englishName: 'Color',
    description: '어울리는 메인 테마 색감 (포근하고 채도 낮은 톤)',
    icon: 'Palette',
    defaultCount: 1,
    maxCount: 3,
    items: COLOR_ITEMS
  }
];
