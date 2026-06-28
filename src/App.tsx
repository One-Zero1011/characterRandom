import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { CATEGORIES_DATA } from './data';
import { generateRandomName } from './data/name';
import {
  CategoryId,
  CategorySelection,
  GeneratedConcept,
  GeneratedKeywordGroup,
  KeywordItem
} from './types';

// Helper component to render Lucide icons dynamically
const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

// Auto title generator for an authentic high-craft feeling
const generateConceptTitle = (groups: GeneratedKeywordGroup[]): string => {
  const findItem = (catId: CategoryId) => {
    const group = groups.find(g => g.categoryId === catId);
    return group && group.items.length > 0 ? group.items[0].text : null;
  };

  const name = findItem('name');
  if (name) {
    return name;
  }

  const personality = findItem('personality');
  const theme = findItem('theme');
  const ability = findItem('ability');
  const item = findItem('item');
  const appearance = findItem('appearance');
  const emoticon = findItem('emoticon');
  const outfit = findItem('outfit');

  let prefix = '';
  let subject = '비밀의 여행자';

  if (personality) {
    prefix = personality;
  } else if (appearance) {
    // Trim extra details if too long
    prefix = appearance.length > 12 ? appearance.substring(0, 12) + '...' : appearance;
  } else if (outfit) {
    prefix = outfit;
  }

  if (theme) {
    subject = theme;
  } else if (ability) {
    // e.g., "불 제어" -> "불을 다루는 자"
    const cleaned = ability.replace(' 제어', '').replace(' 조작', '').replace(' 지배', '');
    subject = `${cleaned}의 능력자`;
  } else if (item) {
    subject = `${item}의 소유자`;
  } else if (emoticon) {
    // E.g., "🐈 고양이" -> "고양이 영혼"
    const emoOnly = emoticon.replace(/[\p{Emoji}\s]+/gu, '');
    subject = emoOnly ? `${emoOnly} 수호자` : '동물 요정';
  }

  if (prefix) {
    return `${prefix} ${subject}`;
  }
  return `${subject}`;
};

// Unified configuration for category sub-types/tags
export const SUB_CATEGORIES_CONFIG: Record<string, { id: string; label: string; desc?: string }[]> = {
  name: [
    { id: 'korean', label: '한국어 🇰🇷', desc: '한국식 가상 이름 조합 (성 + 이름)' },
    { id: 'japanese', label: '일본어 🇯🇵', desc: '일본식 가상 이름 조합 (성 + 이름)' },
    { id: 'western', label: '서양 🇬🇧', desc: '서양식 가상 이름 조합 (이름 + 미들네임 + 성)' },
  ],
  ability: [
    { id: 'element_nature', label: '원소/자연 🌊', desc: '불, 물, 바람, 흙, 전기, 기후 등 자연 원소를 다루는 능력' },
    { id: 'psychic_sensory', label: '정신/초감각 🧠', desc: '염력, 독심술, 정신지배, 예지, 최면 등 초감각 능력' },
    { id: 'spacetime_dimensional', label: '시공간/차원 ⏳', desc: '순간이동, 시간정지, 차원이동, 포탈 등 시공간 관련 능력' },
    { id: 'physical_bio', label: '신체/생체 💪', desc: '초재생, 괴력, 비행, 신체변형, 투명화 등 물리/생물적 능력' },
    { id: 'magic_supernatural', label: '마법/초상 🔮', desc: '사령소환, 치유, 언령, 연금술, 인과 왜곡 등 마법 및 저주 능력' },
    { id: 'special_utility', label: '특수/기타 ⚡', desc: '마력해제, 대미지반사, 절대방어, 등가교환 등 유틸리티성 능력' },
  ],
  color: [
    { id: 'pastel', label: '파스텔 🌸', desc: '부드럽고 가볍고 밝은 색상' },
    { id: 'vivid', label: '원색/비비드 🎨', desc: '선명하고 짙은 원색계열' },
    { id: 'dark', label: '어두운 톤 🖤', desc: '차분하고 묵직한 어두운 색상' },
    { id: 'neon', label: '네온/형광 ⚡', desc: '강렬하게 빛나는 화려한 형광색' },
    { id: 'monochrome', label: '무채색/모노 🔘', desc: '차분하고 미니멀한 블랙, 그레이, 화이트 계열' },
    { id: 'metallic', label: '메탈릭/금속 🪙', desc: '골드, 실버, 크롬 등 깊이 있는 광택의 금속 톤' },
    { id: 'natural', label: '내추럴/어스 🌿', desc: '올리브, 브라운, 테라코타 등 편안한 자연의 대지 톤' },
    { id: 'mystic', label: '신비/몽환 🔮', desc: '우주, 오팔, 노을빛 등 신비롭고 오묘한 혼합 톤' },
  ],
  emoticon: [
    { id: 'animal', label: '동물 🐾', desc: '귀여운 동물 캐릭터' },
    { id: 'nature', label: '식물/자연 🌸', desc: '싱그러운 꽃 and 식물, 자연 테마' },
    { id: 'food', label: '음식/음료 🍔', desc: '다채로운 요리와 맛있는 식음료' },
    { id: 'space', label: '우주/날씨 🪐', desc: '신비로운 하늘, 날씨 및 천체 이모지' },
    { id: 'art', label: '예술/음악 🎨', desc: '예술과 음악, 무대 엔터테인먼트 요소' },
    { id: 'object', label: '도구/물건 🗝️', desc: '각종 열쇠, 도구 및 다용도 소품' },
  ],
  personality: [
    { id: 'positive', label: '긍정적 성격 🌟', desc: '다정하고, 자신감 있고, 배려 넘치는 밝은 성향' },
    { id: 'negative', label: '부정적 성격 ⚠️', desc: '까칠하거나, 소심하거나, 독특한 어두운 결함 성향' },
  ],
  theme: [
    { id: 'job', label: '직업/신분 💼', desc: '검사, 마법사, 해커, 기사 등 역할군' },
    { id: 'personality', label: '성향/성격 🎭', desc: 'S/M, 하라구로, 데레, 소꿉친구 등 캐릭터성' },
    { id: 'cliche', label: '클리셰/모티브 🎬', desc: '빙의자, 시한부, 계약결혼, 회귀 등 서사 요소' },
  ],
  appearance: [
    { id: 'face_eyes', label: '눈/얼굴 👁️', desc: '오드아이, 실눈, 흉터, 점 등 눈과 얼굴의 신체적 특징' },
    { id: 'hair', label: '머리카락 💈', desc: '투톤, 단발, 포니테일, 곱슬머리 등 헤어스타일 및 머리색 특징' },
    { id: 'body_special', label: '특수 신체 🧬', desc: '요정귀, 동물귀, 꼬리, 뿔, 기계 의수/의족, 비늘 등 특수 신체 부위' },
  ],
  outfit: [
    { id: 'full_body', label: '전신/세트 👗', desc: '제복, 한복, 기모노, 드레스 등 한 벌 옷' },
    { id: 'top_bottom', label: '상/하의 👕', desc: '오프숄더, 후드티, 멜빵바지, 스커트 등 단품 옷' },
    { id: 'outer_acc', label: '아우터/잡화 🧥', desc: '코트, 가디건, 스타킹, 신발, 목도리 등 아우터와 소품' },
  ],
  item: [
    { id: 'held_item', label: '휴대 소품 🎒', desc: '나침반, 오르골, 지팡이, 일기장 등 손에 들거나 지니는 도구 및 소품' },
    { id: 'wearable_acc', label: '착용 장신구 💍', desc: '안경, 목도리, 귀걸이, 반지, 가면, 장갑 등 몸에 직접 착용하는 장신구' },
    { id: 'body_acc', label: '신체 장식 🔗', desc: '헤일로, 날개, 타투, 붕대, 구속구, 마법진 등 연출용 신체 장식 및 효과' },
  ],
};

// Generates a random color with optional category/sub-theme constraints
const generateRandomColor = (colorType: string = 'all'): KeywordItem => {
  let hexColor = '';
  
  if (colorType === 'all') {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const toHex = (x: number) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  } else {
    let h = Math.floor(Math.random() * 360);
    let s = 0; // percentage
    let l = 0; // percentage
    
    if (colorType === 'pastel') {
      s = Math.floor(Math.random() * 30) + 50; // 50% to 80%
      l = Math.floor(Math.random() * 15) + 75; // 75% to 90%
    } else if (colorType === 'vivid') {
      s = Math.floor(Math.random() * 20) + 80; // 80% to 100%
      l = Math.floor(Math.random() * 15) + 45; // 45% to 60%
    } else if (colorType === 'dark') {
      s = Math.floor(Math.random() * 35) + 15; // 15% to 50%
      l = Math.floor(Math.random() * 15) + 15; // 15% to 30%
    } else if (colorType === 'neon') {
      s = Math.floor(Math.random() * 10) + 90; // 90% to 100%
      l = Math.floor(Math.random() * 15) + 50; // 50% to 65%
    } else if (colorType === 'monochrome') {
      s = 0; // 0% saturation for grayscale
      l = Math.floor(Math.random() * 80) + 10; // 10% to 90% lightness
    } else if (colorType === 'metallic') {
      const metalTypes = ['gold', 'silver', 'copper', 'bronze', 'platinum'];
      const chosen = metalTypes[Math.floor(Math.random() * metalTypes.length)];
      if (chosen === 'gold') {
        h = Math.floor(Math.random() * 10) + 43; // 43 to 53 (Goldish yellow/orange)
        s = Math.floor(Math.random() * 20) + 65; // 65% to 85%
        l = Math.floor(Math.random() * 15) + 55; // 55% to 70%
      } else if (chosen === 'silver') {
        h = Math.floor(Math.random() * 40) + 180; // 180 to 220 (cool silver tint)
        s = Math.floor(Math.random() * 10) + 5; // very low saturation
        l = Math.floor(Math.random() * 20) + 65; // light gray
      } else if (chosen === 'copper') {
        h = Math.floor(Math.random() * 10) + 15; // 15 to 25 (copperish red/orange)
        s = Math.floor(Math.random() * 15) + 50;
        l = Math.floor(Math.random() * 10) + 45;
      } else if (chosen === 'bronze') {
        h = Math.floor(Math.random() * 10) + 30; // 30 to 40 (bronze/brownish)
        s = Math.floor(Math.random() * 15) + 40;
        l = Math.floor(Math.random() * 10) + 35;
      } else { // platinum
        h = Math.floor(Math.random() * 30) + 210;
        s = Math.floor(Math.random() * 10) + 10;
        l = Math.floor(Math.random() * 10) + 80;
      }
    } else if (colorType === 'natural') {
      const earthTypes = ['olive', 'brown', 'terracotta', 'sand', 'sage'];
      const chosen = earthTypes[Math.floor(Math.random() * earthTypes.length)];
      if (chosen === 'olive') {
        h = Math.floor(Math.random() * 20) + 65; // 65 to 85 (olive/yellow-green)
        s = Math.floor(Math.random() * 15) + 30;
        l = Math.floor(Math.random() * 10) + 35;
      } else if (chosen === 'brown') {
        h = Math.floor(Math.random() * 15) + 20; // 20 to 35
        s = Math.floor(Math.random() * 15) + 30;
        l = Math.floor(Math.random() * 10) + 25;
      } else if (chosen === 'terracotta') {
        h = Math.floor(Math.random() * 10) + 10; // 10 to 20
        s = Math.floor(Math.random() * 15) + 45;
        l = Math.floor(Math.random() * 10) + 45;
      } else if (chosen === 'sand') {
        h = Math.floor(Math.random() * 10) + 35; // 35 to 45
        s = Math.floor(Math.random() * 15) + 25;
        l = Math.floor(Math.random() * 10) + 75;
      } else { // sage green
        h = Math.floor(Math.random() * 30) + 110; // 110 to 140
        s = Math.floor(Math.random() * 15) + 15;
        l = Math.floor(Math.random() * 15) + 55;
      }
    } else if (colorType === 'mystic') {
      const mysticTypes = ['indigo', 'magenta', 'teal', 'aurora'];
      const chosen = mysticTypes[Math.floor(Math.random() * mysticTypes.length)];
      if (chosen === 'indigo') {
        h = Math.floor(Math.random() * 30) + 230; // 230 to 260
        s = Math.floor(Math.random() * 20) + 60;
        l = Math.floor(Math.random() * 15) + 30;
      } else if (chosen === 'magenta') {
        h = Math.floor(Math.random() * 30) + 310; // 310 to 340
        s = Math.floor(Math.random() * 25) + 55;
        l = Math.floor(Math.random() * 15) + 40;
      } else if (chosen === 'teal') {
        h = Math.floor(Math.random() * 30) + 170; // 170 to 200
        s = Math.floor(Math.random() * 25) + 50;
        l = Math.floor(Math.random() * 15) + 35;
      } else { // aurora violet
        h = Math.floor(Math.random() * 40) + 270; // 270 to 310
        s = Math.floor(Math.random() * 20) + 65;
        l = Math.floor(Math.random() * 15) + 55;
      }
    } else {
      // fallback
      s = Math.floor(Math.random() * 100);
      l = Math.floor(Math.random() * 100);
    }
    
    // Convert HSL to RGB
    const sFraction = s / 100;
    const lFraction = l / 100;
    
    const c = (1 - Math.abs(2 * lFraction - 1)) * sFraction;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lFraction - c / 2;
    
    let rFraction = 0, gFraction = 0, bFraction = 0;
    if (0 <= h && h < 60) {
      rFraction = c; gFraction = x; bFraction = 0;
    } else if (60 <= h && h < 120) {
      rFraction = x; gFraction = c; bFraction = 0;
    } else if (120 <= h && h < 180) {
      rFraction = 0; gFraction = c; bFraction = x;
    } else if (180 <= h && h < 240) {
      rFraction = 0; gFraction = x; bFraction = c;
    } else if (240 <= h && h < 300) {
      rFraction = x; gFraction = 0; bFraction = c;
    } else if (300 <= h && h < 360) {
      rFraction = c; gFraction = 0; bFraction = x;
    }
    
    const r = Math.round((rFraction + m) * 255);
    const g = Math.round((gFraction + m) * 255);
    const b = Math.round((bFraction + m) * 255);
    
    const toHex = (val: number) => {
      const hex = Math.max(0, Math.min(255, val)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  
  const uniqueId = `co-rand-${Math.random().toString(36).substring(2, 9)}`;
  return {
    id: uniqueId,
    text: hexColor,
    colorCode: hexColor,
    tag: colorType === 'all' ? undefined : colorType
  };
};

export default function App() {
  // 1. Set up generator configurations
  const [selections, setSelections] = useState<CategorySelection[]>([
    { categoryId: 'name', enabled: true, count: 1 },
    { categoryId: 'personality', enabled: true, count: 1 },
    { categoryId: 'theme', enabled: true, count: 1 },
    { categoryId: 'ability', enabled: true, count: 1 },
    { categoryId: 'appearance', enabled: true, count: 1 },
    { categoryId: 'outfit', enabled: true, count: 1 },
    { categoryId: 'item', enabled: true, count: 1 },
    { categoryId: 'emoticon', enabled: true, count: 1 },
    { categoryId: 'color', enabled: true, count: 1 },
  ]);

  // 2. Main generated result state
  const [currentConcept, setCurrentConcept] = useState<GeneratedConcept | null>(null);
  
  // 3. User interaction states
  const [selectedColorType, setSelectedColorType] = useState<string>('all');
  const [selectedEmoticonTypes, setSelectedEmoticonTypes] = useState<string[]>(['all']);
  const [selectedPersonalityTypes, setSelectedPersonalityTypes] = useState<string[]>(['all']);
  const [selectedThemeTypes, setSelectedThemeTypes] = useState<string[]>(['all']);
  const [selectedAppearanceTypes, setSelectedAppearanceTypes] = useState<string[]>(['all']);
  const [selectedOutfitTypes, setSelectedOutfitTypes] = useState<string[]>(['all']);
  const [selectedItemTypes, setSelectedItemTypes] = useState<string[]>(['all']);
  const [selectedAbilityTypes, setSelectedAbilityTypes] = useState<string[]>(['all']);
  const [selectedNameTypes, setSelectedNameTypes] = useState<string[]>(['all']);

  // 4. Sub-category specific count configurations
  const [subCountModes, setSubCountModes] = useState<Record<CategoryId, boolean>>({
    name: false,
    ability: false,
    appearance: false,
    emoticon: false,
    color: false,
    personality: false,
    theme: false,
    item: false,
    outfit: false,
  });

  const [subCounts, setSubCounts] = useState<Record<CategoryId, Record<string, number>>>({
    name: {},
    ability: {},
    appearance: {},
    emoticon: {},
    color: {},
    personality: {},
    theme: {},
    item: {},
    outfit: {},
  });

  const handleSubCountChange = (catId: CategoryId, subId: string, delta: number) => {
    setSubCounts(prev => {
      const categorySubCounts = prev[catId] || {};
      const currentCount = (categorySubCounts[subId] as number) || 0;
      const nextCount = Math.max(0, currentCount + delta);
      const updatedCategorySubCounts = { ...categorySubCounts, [subId]: nextCount };
      
      const totalSum = (Object.values(updatedCategorySubCounts) as number[]).reduce((a: number, b: number) => a + b, 0);
      setSelections(selPrev =>
        selPrev.map(sel =>
          sel.categoryId === catId
            ? { ...sel, count: Math.max(1, totalSum) }
            : sel
        )
      );
      
      return { ...prev, [catId]: updatedCategorySubCounts };
    });
  };

  const handleSubCountInput = (catId: CategoryId, subId: string, valueStr: string) => {
    let parsed = parseInt(valueStr, 10);
    if (isNaN(parsed) || parsed < 0) parsed = 0;
    
    setSubCounts(prev => {
      const categorySubCounts = prev[catId] || {};
      const updatedCategorySubCounts = { ...categorySubCounts, [subId]: parsed };
      
      const totalSum = (Object.values(updatedCategorySubCounts) as number[]).reduce((a: number, b: number) => a + b, 0);
      setSelections(selPrev =>
        selPrev.map(sel =>
          sel.categoryId === catId
            ? { ...sel, count: Math.max(1, totalSum) }
            : sel
        )
      );
      
      return { ...prev, [catId]: updatedCategorySubCounts };
    });
  };

  const handleEmoticonTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedEmoticonTypes(['all']);
      triggerToast("이모티콘 테마가 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedEmoticonTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("이모티콘 테마가 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`이모티콘 테마 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedEmoticonTypes(next);
    }
  };

  const handlePersonalityTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedPersonalityTypes(['all']);
      triggerToast("성격 유형이 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedPersonalityTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("성격 유형이 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`성격 무드 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedPersonalityTypes(next);
    }
  };

  const handleThemeTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedThemeTypes(['all']);
      triggerToast("콘셉트 태그가 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedThemeTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("콘셉트 태그가 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`콘셉트 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedThemeTypes(next);
    }
  };

  const handleNameTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedNameTypes(['all']);
      triggerToast("이름 스타일이 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedNameTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("이름 스타일이 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`이름 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedNameTypes(next);
    }
  };

  const handleAbilityTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedAbilityTypes(['all']);
      triggerToast("능력 계열이 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedAbilityTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("능력 계열이 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`능력 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedAbilityTypes(next);
    }
  };

  const handleAppearanceTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedAppearanceTypes(['all']);
      triggerToast("외모 스타일이 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedAppearanceTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("외모 스타일이 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`외모 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedAppearanceTypes(next);
    }
  };

  const handleOutfitTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedOutfitTypes(['all']);
      triggerToast("의상 스타일이 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedOutfitTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("의상 스타일이 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`의상 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedOutfitTypes(next);
    }
  };

  const handleItemTypeToggle = (typeId: string, label: string) => {
    if (typeId === 'all') {
      setSelectedItemTypes(['all']);
      triggerToast("소품 테마가 '완전 랜덤'으로 설정되었습니다.");
    } else {
      let next = selectedItemTypes.filter(t => t !== 'all');
      if (next.includes(typeId)) {
        next = next.filter(t => t !== typeId);
      } else {
        next.push(typeId);
      }
      if (next.length === 0) {
        next = ['all'];
        triggerToast("소품 테마가 '완전 랜덤'으로 설정되었습니다.");
      } else {
        triggerToast(`소품 필터에 '${label}'이(가) 추가/제거되었습니다.`);
      }
      setSelectedItemTypes(next);
    }
  };
  const [countInputs, setCountInputs] = useState<Record<CategoryId, string>>({} as Record<CategoryId, string>);
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [savedConcepts, setSavedConcepts] = useState<GeneratedConcept[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [vaultMemo, setVaultMemo] = useState('');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter saved concepts by title, keyword text, translation, memo or colorCode
  const filteredSavedConcepts = savedConcepts.filter(concept => {
    if (!vaultSearchQuery.trim()) return true;
    const query = vaultSearchQuery.toLowerCase().trim();
    
    // Check title
    if (concept.title.toLowerCase().includes(query)) return true;
    
    // Check memo
    if (concept.memo && concept.memo.toLowerCase().includes(query)) return true;
    
    // Check keyword text or translation in all groups
    return concept.groups.some(group => 
      group.items.some(item => 
        item.text.toLowerCase().includes(query) || 
        (item.translation && item.translation.toLowerCase().includes(query)) ||
        (item.colorCode && item.colorCode.toLowerCase().includes(query))
      )
    );
  });

  // Load saved concepts on mount
  useEffect(() => {
    const saved = localStorage.getItem('char_designer_concepts');
    let loadedConcepts: GeneratedConcept[] = [];
    if (saved) {
      try {
        let parsed: GeneratedConcept[] = JSON.parse(saved);
        // Filter out unwanted legacy "의심이 많은 역사가" concepts
        parsed = parsed.filter(c => {
          const isUnwanted = c.title.includes('의심이 많은 역사가') || 
                            (c.title.includes('의심이 많은') && c.title.includes('역사가'));
          return !isUnwanted;
        });
        loadedConcepts = parsed;
        setSavedConcepts(parsed);
        localStorage.setItem('char_designer_concepts', JSON.stringify(parsed));
      } catch (e) {
        console.error('Failed to parse saved concepts', e);
      }
    }

    if (loadedConcepts.length > 0) {
      const first = loadedConcepts[0];
      setCurrentConcept(first);
      setTitleInput(first.title);
      setVaultMemo(first.memo || '');
      setSelectedSavedId(first.id);
    } else {
      setTimeout(() => {
        handleGenerate();
      }, 100);
    }
  }, []);

  // Save to localStorage whenever savedConcepts changes
  const saveToLocalStorage = (updated: GeneratedConcept[]) => {
    setSavedConcepts(updated);
    localStorage.setItem('char_designer_concepts', JSON.stringify(updated));
  };

  // Utility toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Toggle selection category
  const handleToggleCategory = (catId: CategoryId) => {
    setSelections(prev =>
      prev.map(sel => (sel.categoryId === catId ? { ...sel, enabled: !sel.enabled } : sel))
    );
  };

  // Update selection count
  const handleUpdateCount = (catId: CategoryId, delta: number) => {
    setCountInputs(prev => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });

    setSelections(prev =>
      prev.map(sel => {
        if (sel.categoryId !== catId) return sel;
        const newCount = Math.max(1, sel.count + delta);
        return { ...sel, count: newCount };
      })
    );
  };

  // Main Generator logic
  const handleGenerate = () => {
    const activeSelections = selections.filter(s => s.enabled);
    if (activeSelections.length === 0) {
      triggerToast('최소 하나의 카테고리를 선택해주세요.');
      return;
    }

    const groups: GeneratedKeywordGroup[] = [];

    activeSelections.forEach(selection => {
      const categoryInfo = CATEGORIES_DATA.find(c => c.id === selection.categoryId);
      if (!categoryInfo) return;

      const selectedItems: KeywordItem[] = [];

      if (subCountModes[selection.categoryId]) {
        // Precise sub-category count selection logic
        const currentSubCounts = subCounts[selection.categoryId] || {};
        
        if (selection.categoryId === 'color') {
          const selectedHexes: string[] = [];
          Object.entries(currentSubCounts).forEach(([subId, countRaw]) => {
            const count = countRaw as number;
            if (count <= 0) return;
            let attempts = 0;
            const subItems: KeywordItem[] = [];
            while (subItems.length < count && attempts < 100) {
              attempts++;
              const newColor = generateRandomColor(subId);
              if (!selectedHexes.includes(newColor.text)) {
                selectedHexes.push(newColor.text);
                subItems.push(newColor);
              }
            }
            selectedItems.push(...subItems);
          });
        } else {
          Object.entries(currentSubCounts).forEach(([subId, countRaw]) => {
            const count = countRaw as number;
            if (count <= 0) return;
            if (selection.categoryId === 'name') {
              for (let i = 0; i < count; i++) {
                selectedItems.push(generateRandomName(subId));
              }
            } else {
              let pool = categoryInfo.items.filter(item => item.tag === subId);
              if (pool.length === 0) {
                pool = [...categoryInfo.items];
              }
              const drawCount = Math.min(count, pool.length);
              for (let i = 0; i < drawCount; i++) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                selectedItems.push(pool[randomIndex]);
                pool.splice(randomIndex, 1);
              }
            }
          });
        }
      } else {
        // Fallback to standard randomized drawing with multi-select tags
        if (selection.categoryId === 'color') {
          const selectedHexes: string[] = [];
          while (selectedItems.length < selection.count) {
            const newColor = generateRandomColor(selectedColorType);
            if (!selectedHexes.includes(newColor.text)) {
              selectedHexes.push(newColor.text);
              selectedItems.push(newColor);
            }
          }
        } else if (selection.categoryId === 'name') {
          const activeTypes = selectedNameTypes.includes('all') ? ['korean', 'japanese', 'western'] : selectedNameTypes;
          for (let i = 0; i < selection.count; i++) {
            const randomType = activeTypes[Math.floor(Math.random() * activeTypes.length)];
            const newName = generateRandomName(randomType);
            selectedItems.push(newName);
          }
        } else if (selection.categoryId === 'ability') {
          // Filter pool by ability sub-type if selectedAbilityTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedAbilityTypes.includes('all') && selectedAbilityTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedAbilityTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else if (selection.categoryId === 'emoticon') {
          // Filter pool by emoticon sub-type if selectedEmoticonTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedEmoticonTypes.includes('all') && selectedEmoticonTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedEmoticonTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else if (selection.categoryId === 'personality') {
          // Filter pool by personality sub-type if selectedPersonalityTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedPersonalityTypes.includes('all') && selectedPersonalityTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedPersonalityTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else if (selection.categoryId === 'theme') {
          // Filter pool by theme sub-type if selectedThemeTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedThemeTypes.includes('all') && selectedThemeTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedThemeTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else if (selection.categoryId === 'appearance') {
          // Filter pool by appearance sub-type if selectedAppearanceTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedAppearanceTypes.includes('all') && selectedAppearanceTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedAppearanceTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else if (selection.categoryId === 'outfit') {
          // Filter pool by outfit sub-type if selectedOutfitTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedOutfitTypes.includes('all') && selectedOutfitTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedOutfitTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else if (selection.categoryId === 'item') {
          // Filter pool by item sub-type if selectedItemTypes does not contain 'all'
          let pool = [...categoryInfo.items];
          if (!selectedItemTypes.includes('all') && selectedItemTypes.length > 0) {
            pool = pool.filter(item => item.tag && selectedItemTypes.includes(item.tag));
          }
          // Fallback if filtered pool is empty
          if (pool.length === 0) {
            pool = [...categoryInfo.items];
          }
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1);
          }
        } else {
          // Draw random unique items
          const pool = [...categoryInfo.items];
          const drawCount = Math.min(selection.count, pool.length);

          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            selectedItems.push(pool[randomIndex]);
            pool.splice(randomIndex, 1); // Avoid duplicates in the same roll
          }
        }
      }

      groups.push({
        categoryId: selection.categoryId,
        categoryName: categoryInfo.name,
        categoryEnglishName: categoryInfo.englishName,
        items: selectedItems
      });
    });

    // Order categories as defined in database
    const sortedGroups = groups.sort((a, b) => {
      const idxA = CATEGORIES_DATA.findIndex(c => c.id === a.categoryId);
      const idxB = CATEGORIES_DATA.findIndex(c => c.id === b.categoryId);
      return idxA - idxB;
    });

    const newConcept: GeneratedConcept = {
      id: `concept-${Date.now()}`,
      title: generateConceptTitle(sortedGroups),
      createdAt: new Date().toISOString(),
      groups: sortedGroups
    };

    setCurrentConcept(newConcept);
    setTitleInput(newConcept.title);
    setEditingTitle(false);

    // 자동저장 기능 추가!
    const updated = [newConcept, ...savedConcepts];
    saveToLocalStorage(updated);
    setSelectedSavedId(newConcept.id);
    setVaultMemo('');
  };

  // Reroll single specific item in a category group
  const handleRerollSingleItem = (categoryId: CategoryId, itemIdToReplace: string) => {
    if (!currentConcept) return;

    const categoryInfo = CATEGORIES_DATA.find(c => c.id === categoryId);
    if (!categoryInfo) return;

    // Find items currently selected in this category to avoid rolling them again
    const group = currentConcept.groups.find(g => g.categoryId === categoryId);
    if (!group) return;

    let randomNewItem: KeywordItem;

    const itemToReplace = group.items.find(item => item.id === itemIdToReplace);

    if (categoryId === 'color') {
      const currentColors = group.items.map(item => item.text);
      const targetColorType = (itemToReplace && itemToReplace.tag) ? itemToReplace.tag : selectedColorType;
      let attempts = 0;
      do {
        randomNewItem = generateRandomColor(targetColorType);
        attempts++;
      } while (currentColors.includes(randomNewItem.text) && attempts < 50);
    } else if (categoryId === 'name') {
      const targetNameType = (itemToReplace && itemToReplace.tag) ? itemToReplace.tag : (selectedNameTypes.includes('all') ? 'all' : selectedNameTypes[0]);
      randomNewItem = generateRandomName(targetNameType);
    } else {
      const currentlySelectedIds = group.items.map(item => item.id);
      
      // Get all items in category that are NOT currently selected
      let availablePool = categoryInfo.items.filter(item => !currentlySelectedIds.includes(item.id));
      
      // Try to preserve the exact same sub-category tag if possible
      if (itemToReplace && itemToReplace.tag) {
        const tagFiltered = availablePool.filter(item => item.tag === itemToReplace.tag);
        if (tagFiltered.length > 0) {
          availablePool = tagFiltered;
        }
      } else {
        if (categoryId === 'ability' && !selectedAbilityTypes.includes('all') && selectedAbilityTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedAbilityTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }

        if (categoryId === 'emoticon' && !selectedEmoticonTypes.includes('all') && selectedEmoticonTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedEmoticonTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }

        if (categoryId === 'personality' && !selectedPersonalityTypes.includes('all') && selectedPersonalityTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedPersonalityTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }

        if (categoryId === 'theme' && !selectedThemeTypes.includes('all') && selectedThemeTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedThemeTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }

        if (categoryId === 'appearance' && !selectedAppearanceTypes.includes('all') && selectedAppearanceTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedAppearanceTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }

        if (categoryId === 'outfit' && !selectedOutfitTypes.includes('all') && selectedOutfitTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedOutfitTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }

        if (categoryId === 'item' && !selectedItemTypes.includes('all') && selectedItemTypes.length > 0) {
          const filtered = availablePool.filter(item => item.tag && selectedItemTypes.includes(item.tag));
          if (filtered.length > 0) {
            availablePool = filtered;
          }
        }
      }

      if (availablePool.length === 0) {
        triggerToast('더 이상 선택할 수 있는 다른 키워드가 없습니다.');
        return;
      }

      randomNewItem = availablePool[Math.floor(Math.random() * availablePool.length)];
    }

    // Construct updated concept
    const updatedGroups = currentConcept.groups.map(g => {
      if (g.categoryId !== categoryId) return g;
      return {
        ...g,
        items: g.items.map(item => (item.id === itemIdToReplace ? randomNewItem : item))
      };
    });

    const updatedConcept: GeneratedConcept = {
      ...currentConcept,
      groups: updatedGroups,
      // If title wasn't manually edited, let's auto-regenerate it
      title: editingTitle ? currentConcept.title : generateConceptTitle(updatedGroups)
    };

    setCurrentConcept(updatedConcept);
    setTitleInput(updatedConcept.title);

    // 자동저장 기능 추가: 현재 콘셉트가 보관함에 들어있다면 실시간 동기화
    if (savedConcepts.some(c => c.id === updatedConcept.id)) {
      const updated = savedConcepts.map(c => (c.id === updatedConcept.id ? { ...updatedConcept, memo: c.memo } : c));
      saveToLocalStorage(updated);
    }
  };

  // Copy concept as clean plain text
  const handleCopyText = () => {
    if (!currentConcept) return;

    let textToCopy = `✨ [캐릭터 디자인 콘셉트: ${currentConcept.title}] ✨\n\n`;
    
    currentConcept.groups.forEach(group => {
      const itemsText = group.items.map(item => {
        const trans = item.translation ? ` (${item.translation})` : '';
        const color = item.colorCode ? ` [${item.colorCode}]` : '';
        return `- ${item.text}${trans}${color}`;
      }).join('\n');
      textToCopy += `■ ${group.categoryName} (${group.categoryEnglishName})\n${itemsText}\n\n`;
    });

    textToCopy += `생성일: ${new Date(currentConcept.createdAt).toLocaleDateString()}\n`;
    textToCopy += `보러가기: ${window.location.href}`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        triggerToast('클립보드에 키워드가 복사되었습니다.');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        triggerToast('복사에 실패했습니다.');
      });
  };

  // Save current concept to storage vault
  const handleSaveToVault = () => {
    if (!currentConcept) return;

    // Check if already saved
    if (savedConcepts.some(c => c.id === currentConcept.id)) {
      triggerToast('이미 보관함에 저장된 콘셉트입니다.');
      return;
    }

    const conceptToSave: GeneratedConcept = {
      ...currentConcept,
      title: titleInput || currentConcept.title,
    };

    const updated = [conceptToSave, ...savedConcepts];
    saveToLocalStorage(updated);
    setSelectedSavedId(conceptToSave.id);
    setVaultMemo('');
    triggerToast('아이디어 보관함에 저장되었습니다.');
  };

  // Load saved concept back to work desk
  const handleLoadSaved = (concept: GeneratedConcept) => {
    setCurrentConcept(concept);
    setTitleInput(concept.title);
    setSelectedSavedId(concept.id);
    setVaultMemo(concept.memo || '');
    setEditingTitle(false);
    triggerToast(`'${concept.title}' 콘셉트를 불러왔습니다.`);
  };

  // Delete saved concept from storage
  const handleDeleteSaved = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = savedConcepts.filter(c => c.id !== id);
    saveToLocalStorage(updated);
    if (selectedSavedId === id) {
      setSelectedSavedId(null);
      setVaultMemo('');
    }
    triggerToast('보관함에서 삭제되었습니다.');
  };

  // Update memo of currently active saved concept
  const handleUpdateMemo = (val: string) => {
    setVaultMemo(val);
    if (!selectedSavedId) return;

    const updated = savedConcepts.map(c => {
      if (c.id === selectedSavedId) {
        return { ...c, memo: val };
      }
      return c;
    });
    saveToLocalStorage(updated);
  };

  // Update title of current concept
  const handleSaveTitle = () => {
    if (!currentConcept) return;
    const finalTitle = titleInput.trim() || currentConcept.title;
    
    const updatedConcept = {
      ...currentConcept,
      title: finalTitle
    };
    setCurrentConcept(updatedConcept);
    
    // Also update in saved list if it was already saved
    if (savedConcepts.some(c => c.id === currentConcept.id)) {
      const updated = savedConcepts.map(c => (c.id === currentConcept.id ? { ...c, title: finalTitle } : c));
      saveToLocalStorage(updated);
    }
    
    setEditingTitle(false);
    triggerToast('콘셉트 이름이 수정되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#4A4A40] selection:bg-[#E5E1D8] selection:text-[#3A3935] flex flex-col transition-colors duration-300">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#3A3935] text-[#F5F2ED] px-5 py-3 rounded-full shadow-md border border-[#4A4A40] text-sm flex items-center gap-2 font-sans tracking-wide"
            id="app-toast"
          >
            <Icons.Info size={16} className="text-[#BDC4A7]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <header className="border-b border-[#DCD7CC] py-8 px-4 md:px-12 bg-[#F5F2ED]/80 backdrop-blur-md sticky top-0 z-30" id="main-header">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif italic text-3xl md:text-4xl text-[#3A3935] tracking-tight flex flex-wrap items-baseline gap-2">
              Character Muse <span className="text-xl md:text-2xl not-italic font-light opacity-80 font-sans">캐릭터 키워드 생성기</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#4A4A40]/60 mt-2">Randomized Design Keyword Generator</p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <div className="text-left sm:text-right hidden sm:block">
              <span className="text-[10px] uppercase tracking-widest block opacity-50">Version</span>
              <span className="text-xs font-serif italic text-[#3A3935]">v1.0.4 — Seasonal Seed</span>
            </div>
            <button
              onClick={() => setIsVaultOpen(!isVaultOpen)}
              className={`px-5 py-2.5 text-xs rounded-full flex items-center gap-2 border transition-all cursor-pointer ${
                isVaultOpen 
                  ? 'bg-[#E5E1D8] border-[#D1CBC0] text-[#3A3935]' 
                  : 'bg-white hover:bg-[#FAF8F5] border-[#DCD7CC] text-[#4A4A40] shadow-sm'
              }`}
              id="toggle-vault-btn"
            >
              <Icons.Bookmark size={15} className={savedConcepts.length > 0 ? 'fill-[#5A5A40] text-[#5A5A40]' : ''} />
              <span className="font-serif italic font-medium text-sm">Journal ({savedConcepts.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-12 flex flex-col gap-10" id="workspace-container">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Generator Controls */}
          <section className="lg:col-span-5 flex flex-col gap-6" id="generator-controls-section">
            <div className="bg-[#FAF8F5]/80 backdrop-blur-sm rounded-[32px] p-6 md:p-8 border border-[#DCD7CC] shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-4">
                <div className="flex items-center gap-2">
                  <Icons.Sliders size={18} className="text-[#5A5A40]" />
                  <h3 className="font-serif font-medium text-base text-[#3A3935]">Configuration</h3>
                </div>
                <button
                  onClick={() => {
                    setSelections(prev => prev.map(s => ({ ...s, enabled: true })));
                    triggerToast('모든 카테고리를 활성화했습니다.');
                  }}
                  className="text-xs text-[#5A5A40] hover:text-[#3A3935] underline underline-offset-4 font-serif italic"
                >
                  모두 활성화 (All Seeds)
                </button>
              </div>

              {/* Selections List */}
              <div className="flex flex-col gap-3.5">
                {selections.map(selection => {
                  const categoryInfo = CATEGORIES_DATA.find(c => c.id === selection.categoryId);
                  if (!categoryInfo) return null;

                  return (
                    <div 
                      key={selection.categoryId}
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-3.5 ${
                        selection.enabled 
                          ? 'bg-white border-[#DCD7CC]' 
                          : 'bg-white/40 border-[#EAE6DF] opacity-50'
                      }`}
                      id={`category-row-${selection.categoryId}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Checkbox + Label */}
                        <div className="flex items-center gap-3.5 select-none flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleCategory(selection.categoryId)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                              selection.enabled 
                                ? 'border-[#4A4A40]' 
                                : 'border-[#DCD7CC] hover:border-[#4A4A40]'
                            }`}
                            id={`checkbox-${selection.categoryId}`}
                          >
                            {selection.enabled && (
                              <div className="w-2.5 h-2.5 bg-[#4A4A40] rounded-full" />
                            )}
                          </button>
                          
                          <div className="cursor-pointer flex-1 min-w-0" onClick={() => handleToggleCategory(selection.categoryId)}>
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif font-medium text-base text-[#3A3935]">
                                {categoryInfo.name}
                              </span>
                              <span className="text-[10px] font-mono text-[#8C877D] uppercase tracking-wider font-light">
                                {categoryInfo.englishName}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#4A4A40]/70 truncate mt-0.5">
                              {categoryInfo.description}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Adjuster */}
                        {selection.enabled && (
                          <div className="flex items-center gap-1 bg-[#F5F2ED]/60 rounded-full p-0.5 border border-[#DCD7CC] shrink-0">
                            <button
                              onClick={() => handleUpdateCount(selection.categoryId, -1)}
                              disabled={selection.count <= 1}
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#F5F2ED] border border-[#DCD7CC] text-[#4A4A40] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              title="개수 줄이기"
                              id={`decrease-count-${selection.categoryId}`}
                            >
                              <Icons.Minus size={11} />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={
                                countInputs[selection.categoryId] !== undefined 
                                  ? countInputs[selection.categoryId] 
                                  : selection.count.toString()
                              }
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setCountInputs(prev => ({ ...prev, [selection.categoryId]: val }));
                                const parsed = parseInt(val, 10);
                                if (!isNaN(parsed) && parsed >= 1) {
                                  setSelections(prev =>
                                    prev.map(sel => (sel.categoryId === selection.categoryId ? { ...sel, count: parsed } : sel))
                                  );
                                }
                              }}
                              onBlur={() => {
                                setCountInputs(prev => {
                                  const next = { ...prev };
                                  delete next[selection.categoryId];
                                  return next;
                                });
                                if (selection.count < 1) {
                                  setSelections(prev =>
                                    prev.map(sel => (sel.categoryId === selection.categoryId ? { ...sel, count: 1 } : sel))
                                  );
                                }
                              }}
                              className="w-10 text-center text-xs font-mono font-semibold text-[#3A3935] bg-transparent border-none focus:outline-none p-0 cursor-text"
                              title="직접 숫자 입력 가능"
                              id={`count-input-${selection.categoryId}`}
                            />
                            <button
                              onClick={() => handleUpdateCount(selection.categoryId, 1)}
                              className="w-7 h-7 rounded-full bg-white hover:bg-[#F5F2ED] border border-[#DCD7CC] text-[#4A4A40] flex items-center justify-center transition-colors cursor-pointer"
                              title="개수 늘리기"
                              id={`increase-count-${selection.categoryId}`}
                            >
                              <Icons.Plus size={11} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Sub-category Selector & Specific Counts Controls */}
                      {selection.enabled && SUB_CATEGORIES_CONFIG[selection.categoryId] && (
                        <div className="border-t border-[#F0EFEA] pt-3.5 mt-0.5 flex flex-col gap-2.5">
                          {/* Sub-count Toggle Option */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8C877D] font-mono">
                              <Icons.Sliders size={11} />
                              <span>세부 개수 설정 (Set Specific Sub-counts)</span>
                            </div>
                            <button
                              onClick={() => {
                                setSubCountModes(prev => {
                                  const isEnabling = !prev[selection.categoryId];
                                  const next = { ...prev, [selection.categoryId]: isEnabling };
                                  
                                  if (isEnabling) {
                                    // Distribute current selection.count to sub-categories as starting value
                                    const config = SUB_CATEGORIES_CONFIG[selection.categoryId] || [];
                                    const initial: Record<string, number> = {};
                                    config.forEach((sub, idx) => {
                                      initial[sub.id] = idx === 0 ? selection.count : 0;
                                    });
                                    setSubCounts(cPrev => ({ ...cPrev, [selection.categoryId]: initial }));
                                  }
                                  
                                  return next;
                                });
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                subCountModes[selection.categoryId] ? 'bg-[#5A5A40]' : 'bg-[#E5E1D8]'
                              }`}
                              title="세부 하위 카테고리별로 개수를 각각 다르게 설정합니다."
                              id={`subcount-toggle-${selection.categoryId}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  subCountModes[selection.categoryId] ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {subCountModes[selection.categoryId] ? (
                            /* Specific sub-counts stepper inputs */
                            <div className="flex flex-col gap-1.5 bg-[#FAF8F5]/80 p-3 rounded-2xl border border-[#F0EFEA] shadow-2xs">
                              {SUB_CATEGORIES_CONFIG[selection.categoryId].map(sub => {
                                const currentCategorySubCounts = subCounts[selection.categoryId] || {};
                                const count = currentCategorySubCounts[sub.id] || 0;
                                return (
                                  <div key={sub.id} className="flex items-center justify-between text-xs py-1">
                                    <div className="flex flex-col flex-1 pr-4">
                                      <span className="font-sans font-medium text-[#4A4A40] text-[11px]">{sub.label}</span>
                                      {sub.desc && <span className="text-[9px] text-[#8C877D] font-light leading-snug">{sub.desc}</span>}
                                    </div>
                                    <div className="flex items-center gap-1 bg-white border border-[#DCD7CC] rounded-full p-0.5 shadow-2xs shrink-0">
                                      <button
                                        onClick={() => handleSubCountChange(selection.categoryId, sub.id, -1)}
                                        disabled={count <= 0}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors text-xs font-semibold cursor-pointer ${
                                          count <= 0 ? 'text-[#C5C1B5] cursor-not-allowed opacity-30' : 'hover:bg-[#F5F2ED] text-[#4A4A40]'
                                        }`}
                                      >
                                        <Icons.Minus size={9} />
                                      </button>
                                      <input
                                        type="text"
                                        value={count}
                                        onChange={(e) => handleSubCountInput(selection.categoryId, sub.id, e.target.value)}
                                        className="w-7 text-center text-[11px] font-mono font-semibold text-[#3A3935] bg-transparent border-none focus:outline-none p-0 cursor-text"
                                      />
                                      <button
                                        onClick={() => handleSubCountChange(selection.categoryId, sub.id, 1)}
                                        className="w-6 h-6 rounded-full hover:bg-[#F5F2ED] text-[#4A4A40] flex items-center justify-center transition-colors text-xs font-semibold cursor-pointer"
                                      >
                                        <Icons.Plus size={9} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="text-[10px] text-[#8C877D] border-t border-[#F0EFEA] pt-1.5 mt-1 flex justify-between items-center px-1">
                                <span className="font-light">각 분류에서 무작위로 선택하여 조합됩니다.</span>
                                <div>
                                  합계: <span className="font-mono font-bold text-[#4A4A40]">{selection.count}</span>개
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Existing tags / themes selector chips */
                            <div className="flex flex-wrap gap-1.5">
                              {/* If color, render its unique layout, otherwise render standard multi-select toggle */}
                              {selection.categoryId === 'color' ? (
                                <>
                                  {[
                                    { id: 'all', label: '완전 랜덤 🎲', desc: '모든 색상 무작위 생성' },
                                    ...SUB_CATEGORIES_CONFIG.color
                                  ].map(type => {
                                    const isSelected = selectedColorType === type.id;
                                    return (
                                      <button
                                        key={type.id}
                                        onClick={() => {
                                          setSelectedColorType(type.id);
                                          triggerToast(`색상 테마가 '${type.label}'으로 설정되었습니다.`);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          isSelected
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title={type.desc}
                                        id={`color-type-chip-${type.id}`}
                                      >
                                        <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                      </button>
                                    );
                                  })}
                                </>
                              ) : (
                                <>
                                  {/* Rendering the specific selection chips based on category */}
                                  {selection.categoryId === 'emoticon' && (
                                    <>
                                      <button
                                        onClick={() => handleEmoticonTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedEmoticonTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 이모티콘 무작위 생성"
                                        id="emoticon-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.emoticon.map(type => {
                                        const isSelected = selectedEmoticonTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleEmoticonTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`emoticon-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'name' && (
                                    <>
                                      <button
                                        onClick={() => handleNameTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedNameTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 이름 무작위 생성"
                                        id="name-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.name.map(type => {
                                        const isSelected = selectedNameTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleNameTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`name-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'ability' && (
                                    <>
                                      <button
                                        onClick={() => handleAbilityTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedAbilityTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 능력 무작위 생성"
                                        id="ability-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.ability.map(type => {
                                        const isSelected = selectedAbilityTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleAbilityTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`ability-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'personality' && (
                                    <>
                                      <button
                                        onClick={() => handlePersonalityTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedPersonalityTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 성격 무작위 생성"
                                        id="personality-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.personality.map(type => {
                                        const isSelected = selectedPersonalityTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handlePersonalityTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`personality-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'theme' && (
                                    <>
                                      <button
                                        onClick={() => handleThemeTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedThemeTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 캐릭터 콘셉트 무작위 생성"
                                        id="theme-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.theme.map(type => {
                                        const isSelected = selectedThemeTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleThemeTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`theme-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'appearance' && (
                                    <>
                                      <button
                                        onClick={() => handleAppearanceTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedAppearanceTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 외모 무작위 생성"
                                        id="appearance-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.appearance.map(type => {
                                        const isSelected = selectedAppearanceTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleAppearanceTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`appearance-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'outfit' && (
                                    <>
                                      <button
                                        onClick={() => handleOutfitTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedOutfitTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 의상 무작위 생성"
                                        id="outfit-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.outfit.map(type => {
                                        const isSelected = selectedOutfitTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleOutfitTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`outfit-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                  {selection.categoryId === 'item' && (
                                    <>
                                      <button
                                        onClick={() => handleItemTypeToggle('all', '완전 랜덤')}
                                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                          selectedItemTypes.includes('all')
                                            ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                            : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                        }`}
                                        title="모든 소품 무작위 생성"
                                        id="item-type-chip-all"
                                      >
                                        <span className="font-sans font-medium text-[11px]">완전 랜덤 🎲</span>
                                      </button>
                                      {SUB_CATEGORIES_CONFIG.item.map(type => {
                                        const isSelected = selectedItemTypes.includes(type.id);
                                        return (
                                          <button
                                            key={type.id}
                                            onClick={() => handleItemTypeToggle(type.id, type.label)}
                                            className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                                              isSelected
                                                ? 'bg-[#4A4A40] border-[#4A4A40] text-white shadow-xs'
                                                : 'bg-[#F5F2ED]/60 hover:bg-[#F5F2ED] border-[#DCD7CC] text-[#4A4A40]'
                                            }`}
                                            title={type.desc}
                                            id={`item-type-chip-${type.id}`}
                                          >
                                            <span className="font-sans font-medium text-[11px]">{type.label}</span>
                                          </button>
                                        );
                                      })}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Big Draw Button */}
              <button
                onClick={handleGenerate}
                className="w-full mt-3 bg-[#5A5A40] text-[#F5F2ED] py-5 rounded-[40px] text-lg font-serif italic shadow-md hover:bg-[#4A4A30] transition-all transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                id="draw-keywords-btn"
              >
                <Icons.Shuffle size={18} />
                <span>무작위 키워드 수확하기 (Harvest)</span>
              </button>
            </div>
          </section>

          {/* Right Column: Sketchpad Concept Result */}
          <section className="lg:col-span-7 flex flex-col gap-6" id="concept-board-section">
            <AnimatePresence mode="wait">
              {currentConcept ? (
                <motion.div
                  key={currentConcept.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="bg-white rounded-[48px] border border-[#DCD7CC] shadow-sm overflow-hidden relative"
                  id="active-concept-card"
                >
                  <div className="p-8 md:p-12 flex flex-col gap-8">
                    
                    {/* Concept Header */}
                    <div className="flex flex-col gap-4 border-b border-[#F0EFEA] pb-8">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-serif italic tracking-widest text-[#5A5A40] bg-[#FAF8F5] border border-[#DCD7CC] py-1 px-3 rounded-full uppercase">
                          Generated Muse Card
                        </span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#E5E1D8]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#DCD7CC]"></div>
                          <div className="w-2 h-2 rounded-full bg-[#5A5A40]"></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 group mt-2">
                        {editingTitle ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              value={titleInput}
                              onChange={(e) => setTitleInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle();
                                if (e.key === 'Escape') setEditingTitle(false);
                              }}
                              className="font-serif italic font-semibold text-xl md:text-2xl text-[#3A3935] border-b-2 border-[#5A5A40] focus:outline-none bg-transparent py-0.5 px-1 flex-1"
                              autoFocus
                              id="title-edit-input"
                            />
                            <button
                              onClick={handleSaveTitle}
                              className="p-1.5 hover:bg-[#F5F2ED] text-[#5A5A40] rounded-full transition-colors cursor-pointer"
                              title="확인"
                              id="title-save-btn"
                            >
                              <Icons.Check size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setTitleInput(currentConcept.title);
                                setEditingTitle(false);
                              }}
                              className="p-1.5 hover:bg-[#F5F2ED] text-[#8C877D] rounded-full transition-colors cursor-pointer"
                              title="취소"
                              id="title-cancel-btn"
                            >
                              <Icons.X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <h3 className="font-serif italic font-semibold text-xl md:text-2xl text-[#3A3935] tracking-tight flex items-center gap-2">
                              {currentConcept.title}
                              <button
                                onClick={() => {
                                  setTitleInput(currentConcept.title);
                                  setEditingTitle(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5F2ED] rounded-full text-[#8C877D] transition-all cursor-pointer"
                                title="이름 수정"
                                id="title-trigger-edit-btn"
                              >
                                <Icons.Edit2 size={13} />
                              </button>
                            </h3>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={handleCopyText}
                                className="px-3.5 py-1.5 hover:bg-[#FAF8F5] rounded-full text-[#4A4A40] transition-colors flex items-center gap-1.5 text-xs font-serif italic border border-[#DCD7CC] cursor-pointer"
                                title="텍스트 복사"
                                id="concept-copy-btn"
                              >
                                {copied ? <Icons.Check size={12} className="text-[#5A5A40]" /> : <Icons.Copy size={12} />}
                                <span className="hidden sm:inline">Copy</span>
                              </button>
                              <button
                                onClick={handleSaveToVault}
                                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 text-xs font-serif italic border cursor-pointer ${
                                  savedConcepts.some(c => c.id === currentConcept.id)
                                    ? 'bg-[#FAFDF6] border-[#DCEAD0] text-[#5A5A40]'
                                    : 'bg-white hover:bg-[#FAF8F5] border-[#DCD7CC] text-[#4A4A40]'
                                }`}
                                id="concept-save-btn"
                              >
                                <Icons.Bookmark size={12} className={savedConcepts.some(c => c.id === currentConcept.id) ? 'fill-[#5A5A40] text-[#5A5A40]' : ''} />
                                <span className="hidden sm:inline">
                                  {savedConcepts.some(c => c.id === currentConcept.id) ? 'Saved' : 'Save'}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Keywords List (The Main Result Cards) */}
                    <div className="flex flex-col gap-8" id="concept-groups-container">
                      {currentConcept.groups.map((group, groupIdx) => (
                        <div key={group.categoryId} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 border-b border-[#F5F2ED] pb-1.5">
                            <span className="p-1 rounded-full bg-[#F5F2ED] text-[#5A5A40]">
                              <CategoryIcon name={CATEGORIES_DATA.find(c => c.id === group.categoryId)?.icon || 'Tag'} className="w-3.5 h-3.5" />
                            </span>
                            <h4 className="text-[11px] font-semibold text-[#8C877D] tracking-widest uppercase font-sans">
                              {group.categoryName} <span className="font-serif italic font-normal lowercase opacity-75">({group.categoryEnglishName})</span>
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {group.items.map((item, itemIdx) => (
                              <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (groupIdx * 0.08) + (itemIdx * 0.04), duration: 0.2 }}
                                key={item.id}
                                className="group/item relative bg-[#FDFDFB] border border-[#DCD7CC] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-[#4A4A40] transition-all"
                                id={`keyword-card-${item.id}`}
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  {/* Render visual aids for color category */}
                                  {group.categoryId === 'color' && item.colorCode && (
                                    <div 
                                      className="w-8 h-8 rounded-xl shadow-inner border border-black/5 shrink-0" 
                                      style={{ backgroundColor: item.colorCode }}
                                      title={item.colorCode}
                                    />
                                  )}

                                  {/* Text & translations */}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="font-serif font-medium text-base text-[#3A3935] leading-tight">
                                        {item.text}
                                      </p>
                                      {group.categoryId === 'name' && item.tag && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-sans font-medium bg-[#F5F2ED] text-[#5A5A40] border border-[#DCD7CC] uppercase tracking-wider scale-95 origin-left select-none">
                                          {item.tag === 'korean' ? '한국 🇰🇷' : item.tag === 'japanese' ? '일본 🇯🇵' : '서양 🇬🇧'}
                                        </span>
                                      )}
                                      {group.categoryId === 'theme' && item.tag && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-sans font-medium bg-[#F5F2ED] text-[#5A5A40] border border-[#DCD7CC] uppercase tracking-wider scale-95 origin-left select-none">
                                          {item.tag === 'job' ? '직업' : item.tag === 'personality' ? '성향' : '클리셰'}
                                        </span>
                                      )}
                                      {group.categoryId === 'appearance' && item.tag && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-sans font-medium bg-[#F5F2ED] text-[#5A5A40] border border-[#DCD7CC] uppercase tracking-wider scale-95 origin-left select-none">
                                          {item.tag === 'face_eyes' ? '눈/얼굴' : item.tag === 'hair' ? '머리카락' : '특수 신체'}
                                        </span>
                                      )}
                                      {group.categoryId === 'outfit' && item.tag && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-sans font-medium bg-[#F5F2ED] text-[#5A5A40] border border-[#DCD7CC] uppercase tracking-wider scale-95 origin-left select-none">
                                          {item.tag === 'full_body' ? '전신/세트' : item.tag === 'top_bottom' ? '상/하의' : '아우터/잡화'}
                                        </span>
                                      )}
                                      {group.categoryId === 'item' && item.tag && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-sans font-medium bg-[#F5F2ED] text-[#5A5A40] border border-[#DCD7CC] uppercase tracking-wider scale-95 origin-left select-none">
                                          {item.tag === 'held_item' ? '휴대 소품' : item.tag === 'wearable_acc' ? '착용 장신구' : '신체 장식'}
                                        </span>
                                      )}
                                    </div>
                                    {item.translation && (
                                      <p className="text-xs font-mono text-[#8C877D] mt-0.5 truncate">
                                        {item.translation}
                                      </p>
                                    )}
                                    {group.categoryId === 'color' && item.colorCode && item.colorCode !== item.text && (
                                      <span className="text-[10px] font-mono text-[#8C877D]">
                                        {item.colorCode}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Single Reroll Button */}
                                <button
                                  onClick={() => handleRerollSingleItem(group.categoryId, item.id)}
                                  className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-[#F5F2ED] text-[#8C877D] hover:text-[#3A3935] rounded-full transition-all cursor-pointer"
                                  title="이 슬롯만 다시 뽑기"
                                  id={`reroll-slot-${item.id}`}
                                >
                                  <Icons.RefreshCw size={13} className="group-active/item:rotate-180 transition-transform duration-300" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desk Memo attachment if saved */}
                    {savedConcepts.some(c => c.id === currentConcept.id) && (
                      <div className="mt-4 pt-6 border-t border-[#F0EFEA] flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C877D] tracking-widest uppercase font-sans">
                          <Icons.FileText size={14} className="text-[#5A5A40]" />
                          <span>나만의 디자인 노트 / 아이디어 메모</span>
                        </div>
                        <textarea
                          value={vaultMemo}
                          onChange={(e) => handleUpdateMemo(e.target.value)}
                          placeholder="이 키워드를 보고 연상되는 캐릭터 외모 디테일, 스토리 배경, 무기, 혹은 세계관 등을 자유롭게 적어보세요. 보관함에 즉시 자동 저장됩니다."
                          className="w-full min-h-[120px] p-4 text-xs bg-[#FAF9F5] border border-[#DCD7CC] rounded-2xl focus:outline-none focus:border-[#4A4A40] focus:bg-white text-[#4A4A40] leading-relaxed resize-y font-sans transition-all"
                          id="concept-memo-textarea"
                        />
                        <span className="text-[10px] text-[#8C877D] text-right font-serif italic self-end">
                          * 내용 입력 시 보관함에 실시간 자동 업데이트됩니다.
                        </span>
                      </div>
                    )}

                    {/* Organic Footer */}
                    <footer className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end border-t border-[#F0EFEA] pt-8">
                      <p className="text-xs italic opacity-50 max-w-[280px] font-serif text-[#4A4A40] leading-relaxed">
                        Combine these seeds to sprout your next character design concept.
                      </p>
                      {!savedConcepts.some(c => c.id === currentConcept.id) && (
                        <button 
                          onClick={handleSaveToVault}
                          className="text-[11px] uppercase tracking-widest border-b border-[#4A4A40] pb-1 hover:opacity-50 transition-all font-sans font-medium cursor-pointer text-[#4A4A40]"
                        >
                          Save to Journal
                        </button>
                      )}
                    </footer>

                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-[48px] border border-[#DCD7CC] p-16 text-center flex flex-col items-center justify-center gap-4">
                  <Icons.Sparkles size={36} className="text-[#D1CBC0] animate-pulse" />
                  <p className="font-serif italic text-base text-[#8C877D]">활성화된 콘셉트 카드가 없습니다.</p>
                  <button
                    onClick={handleGenerate}
                    className="mt-2 py-3 px-6 rounded-full bg-[#5A5A40] text-white font-serif italic text-sm hover:bg-[#4A4A30] transition-colors cursor-pointer"
                    id="desolate-draw-btn"
                  >
                    Harvest Keywords
                  </button>
                </div>
              )}
            </AnimatePresence>
          </section>

        </div>

        {/* Vault Section (Storage Desk Drawer) */}
        <section 
          className={`bg-[#FAF8F5] border border-[#DCD7CC] rounded-[32px] p-6 md:p-8 transition-all duration-300 ${
            isVaultOpen ? 'opacity-100 scale-100' : 'hidden opacity-0 scale-95'
          }`}
          id="vault-panel"
        >
          <div className="flex items-center justify-between border-b border-[#DCD7CC] pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#E5E1D8] text-[#5A5A40]">
                <Icons.Bookmark size={18} />
              </div>
              <div>
                <h3 className="font-serif font-medium text-base text-[#3A3935]">아이디어 보관함 (Journal)</h3>
                <p className="text-xs text-[#8C877D]">영감을 간직해둔 캐릭터 콘셉트들이 기록 보관 중입니다.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {savedConcepts.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('보관된 모든 콘셉트를 비우시겠습니까?')) {
                      saveToLocalStorage([]);
                      setSelectedSavedId(null);
                      setVaultMemo('');
                      triggerToast('보관함이 모두 비워졌습니다.');
                    }
                  }}
                  className="text-xs text-[#BE8574] hover:text-red-700 transition-colors flex items-center gap-1 font-serif italic cursor-pointer"
                  id="clear-vault-btn"
                >
                  <Icons.Trash2 size={13} />
                  <span>전체 삭제</span>
                </button>
              )}
              <button 
                onClick={() => setIsVaultOpen(false)}
                className="p-1.5 hover:bg-[#E5E1D8] rounded-full text-[#8C877D] hover:text-[#3A3935] transition-colors cursor-pointer"
                title="닫기"
                id="close-vault-btn"
              >
                <Icons.X size={16} />
              </button>
            </div>
          </div>

          {savedConcepts.length === 0 ? (
            <div className="py-16 border-2 border-dashed border-[#DCD7CC] rounded-[24px] text-center flex flex-col items-center justify-center gap-3">
              <Icons.BookmarkCheck size={36} className="text-[#DCD7CC]" />
              <div>
                <p className="font-serif italic text-base text-[#4A4A40] font-medium">보관함이 비어있습니다</p>
                <p className="text-xs text-[#8C877D] mt-1">마음에 드는 키워드 조합을 찾아 저장해보세요.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Search input field */}
              <div className="relative max-w-md w-full" id="vault-search-container">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8C877D]">
                  <Icons.Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="제목, 키워드, 메모 내용으로 보관함 검색..."
                  value={vaultSearchQuery}
                  onChange={(e) => setVaultSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#DCD7CC] rounded-full text-xs text-[#3A3935] focus:outline-none focus:border-[#4A4A40] focus:ring-1 focus:ring-[#4A4A40] transition-all placeholder:text-[#8C877D]/50 shadow-sm"
                  id="vault-search-input"
                />
                {vaultSearchQuery && (
                  <button
                    onClick={() => setVaultSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8C877D] hover:text-[#3A3935] cursor-pointer"
                    title="검색어 지우기"
                    id="vault-search-clear-btn"
                  >
                    <Icons.X size={15} />
                  </button>
                )}
              </div>

              {filteredSavedConcepts.length === 0 ? (
                <div className="py-16 border border-dashed border-[#DCD7CC] rounded-[24px] text-center flex flex-col items-center justify-center gap-3 bg-white/20">
                  <Icons.Search size={32} className="text-[#DCD7CC] stroke-[1.5]" />
                  <div>
                    <p className="font-serif italic text-base text-[#4A4A40] font-medium">검색 결과가 없습니다</p>
                    <p className="text-xs text-[#8C877D] mt-1">단어의 맞춤법을 확인하거나 다른 키워드로 다시 검색해 보세요.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="vault-items-grid">
                  {filteredSavedConcepts.map(concept => {
                    const isSelected = currentConcept?.id === concept.id;
                    return (
                      <div
                        key={concept.id}
                        onClick={() => handleLoadSaved(concept)}
                        className={`group border rounded-2xl p-5 cursor-pointer transition-all flex flex-col gap-4 justify-between ${
                          isSelected 
                            ? 'bg-white border-[#5A5A40] ring-4 ring-[#5A5A40]/5' 
                            : 'bg-[#FCFAF7] border-[#DCD7CC] hover:bg-white hover:border-[#4A4A40]'
                        }`}
                        id={`vault-item-card-${concept.id}`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif italic font-medium text-base text-[#3A3935] group-hover:text-[#5A5A40] transition-colors line-clamp-1">
                              {concept.title}
                            </h4>
                            
                            <button
                              onClick={(e) => handleDeleteSaved(concept.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F5F2ED] text-[#8C877D] hover:text-[#BE8574] rounded-full transition-all shrink-0 cursor-pointer"
                              title="삭제"
                              id={`delete-vault-item-${concept.id}`}
                            >
                              <Icons.Trash2 size={13} />
                            </button>
                          </div>

                          {/* Display a micro-tag row of keywords preview */}
                          <div className="flex flex-wrap gap-1.5 mt-2 overflow-hidden max-h-[56px] line-clamp-2">
                            {concept.groups.map(group => 
                              group.items.map(item => (
                                <span 
                                  key={item.id} 
                                  className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#DCD7CC]/50 ${
                                    group.categoryId === 'color' 
                                      ? 'bg-[#FAF8F5]' 
                                      : 'bg-white text-[#4A4A40]'
                                  }`}
                                >
                                  {group.categoryId === 'color' && item.colorCode && (
                                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: item.colorCode }} />
                                  )}
                                  <span>{item.text.split(' ')[0]}</span>
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="border-t border-[#F0EFEA] pt-3 mt-1 flex items-center justify-between text-[#8C877D]">
                          <span className="text-[10px] font-mono flex items-center gap-1">
                            <Icons.Calendar size={10} />
                            {new Date(concept.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                          </span>
                          {concept.memo && (
                            <span className="text-[11px] text-[#5A5A40] flex items-center gap-0.5 font-serif italic" title="메모 기록 있음">
                              <Icons.FileText size={11} />
                              <span>Note</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

      </main>

      {/* Footer Info */}
      <footer className="border-t border-[#DCD7CC] mt-16 py-10 px-4 text-center text-xs text-[#8C877D] bg-white/10" id="main-footer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} 먁먁</p>
        </div>
      </footer>

    </div>
  );
}
