export type CategoryId = 'name' | 'ability' | 'appearance' | 'emoticon' | 'color' | 'personality' | 'theme' | 'item' | 'outfit';

export interface KeywordItem {
  id: string;
  text: string;
  translation?: string;
  colorCode?: string; // Muted color hex code, used only for the 'color' category
  emoticon?: string; // Muted emoji/icon, used only for the 'emoticon' category
  tag?: string; // Optional filtering tag, used for color, emoticon sub-categories
}

export interface CategoryInfo {
  id: CategoryId;
  name: string; // Korean name (e.g., "능력")
  englishName: string; // English name (e.g., "Ability")
  description: string; // Short helper text
  icon: string; // Icon identifier for rendering
  defaultCount: number;
  maxCount: number;
  items: KeywordItem[];
}

export interface CategorySelection {
  categoryId: CategoryId;
  enabled: boolean;
  count: number;
}

export interface GeneratedKeywordGroup {
  categoryId: CategoryId;
  categoryName: string;
  categoryEnglishName: string;
  items: KeywordItem[];
}

export interface GeneratedConcept {
  id: string;
  title: string;
  createdAt: string;
  groups: GeneratedKeywordGroup[];
  memo?: string;
}
