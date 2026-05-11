export interface FoodCard {
  id: number;
  name: string;
  emoji: string;
  rarity: 'normal' | 'common' | 'rare' | 'epic' | 'mazu';
  desc?: string;
}

export interface FoodItem {
  name: string;
  emoji: string;
  price: number;
  category: string;
}

export interface ToolItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  effect: string;
  desc: string;
  uses: number | null;
  reactionMult: number;
  questMult: number;
  epicBoost: boolean;
  mazuShield: number | false;
}

export interface OwnedTool {
  id: string;
  usedCount: number;
}

export interface ActiveTool extends ToolItem {
  usedCount: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  emoji: string;
}

export interface RecipeStep {
  step: number;
  text: string;
  emoji: string;
}

export interface RecipeData {
  title: string;
  intro: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  memo: string;
}

export interface Reactions {
  fav: number;
  made: number;
  comment: string;
}

export interface Post {
  id: number;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic';
  ingredients: string[];
  recipeData: RecipeData | null;
  reactions: Reactions | null;
  earned: number;
  loading: boolean;
  postedAt: Date;
}

export interface Quest {
  id: number;
  request: string;
  targetDish: string;
  rank: 'normal' | 'rare' | 'special';
  emoji: string;
  user: string;
  done: boolean;
  bonus?: number;
  createdAt: Date;
}

export interface ExtraStats {
  mazuTotal: number;
  trashTotal: number;
  maxCombo: number;
  nightCook: number;
  speedCook: number;
  allGenre: boolean;
  noMazuStreak: number;
  shopCount: number;
  recentCookTimes: number[];
}

export interface Trophy {
  id: string;
  cat: string;
  emoji: string;
  name: string;
  desc: string;
  check: (s: StatsForTrophy) => boolean;
}

export interface StatsForTrophy {
  totalDishes: number;
  totalFav: number;
  totalMade: number;
  totalEarned: number;
  questClear: number;
  questSpecial: number;
  rareCount: number;
  epicCount: number;
  mazuCount: number;
  trashCount: number;
  toolCount: number;
  goldUsed: number;
  hasFenix: boolean;
  maxCombo: number;
  nightCook: number;
  speedCook: number;
  allGenre: boolean;
  noMazuStreak: number;
  currentYen: number;
  shopCount: number;
  trophyCount: number;
}

export type PageName = 'kitchen' | 'cookpad' | 'quest' | 'trophy' | 'shop';
