import { FoodCard, OwnedTool, ActiveTool, Post, Quest, ExtraStats, StatsForTrophy } from './types';
import { FOOD_ITEMS, TOOL_ITEMS, QUEST_BONUS, REACTION_YEN } from './data';

let uid = 1;

const KNOWN_EMOJI: Record<string, string> = Object.fromEntries(
  FOOD_ITEMS.map(i => [i.name, i.emoji])
);

export function getEmoji(name: string): string {
  return KNOWN_EMOJI[name] || '🍽️';
}

export function makeCard(name: string): FoodCard {
  return { id: uid++, name, emoji: getEmoji(name), rarity: 'normal' };
}

export function makeMazu(names: string[]): FoodCard {
  return { id: uid++, name: '激まず', emoji: '🤢', rarity: 'mazu', desc: `(${names.join('＋')})` };
}

export function nextId(): number {
  return uid++;
}

export function getActiveTools(ownedTools: OwnedTool[]): ActiveTool[] {
  return ownedTools
    .filter(t => {
      const def = TOOL_ITEMS.find(d => d.id === t.id);
      if (!def) return false;
      if (def.uses !== null && t.usedCount >= def.uses) return false;
      return true;
    })
    .map(t => ({ ...TOOL_ITEMS.find(d => d.id === t.id)!, ...t }));
}

export function calcReactionYen(fav: number, made: number, tools: ActiveTool[]): number {
  const mult = tools.reduce((m, t) => {
    if (t.id === 'gold_pan' && t.usedCount >= 1) return m;
    return m * t.reactionMult;
  }, 1);
  return Math.round((fav * REACTION_YEN.fav + made * REACTION_YEN.made) * mult);
}

export function calcQuestBonus(rank: string, tools: ActiveTool[]): number {
  const base = QUEST_BONUS[rank] || QUEST_BONUS.normal;
  const mult = tools.reduce((m, t) => m * t.questMult, 1);
  return Math.round(base * mult);
}

export function calcStats(
  posts: Post[],
  quests: Quest[],
  ownedTools: OwnedTool[],
  yen: number,
  extra: ExtraStats
): StatsForTrophy {
  const dishes = posts.filter(p => !p.loading);
  return {
    totalDishes:  dishes.length,
    totalFav:     dishes.reduce((s, p) => s + (p.reactions?.fav || 0), 0),
    totalMade:    dishes.reduce((s, p) => s + (p.reactions?.made || 0), 0),
    totalEarned:  dishes.reduce((s, p) => s + (p.earned || 0), 0),
    questClear:   quests.filter(q => q.done).length,
    questSpecial: quests.filter(q => q.done && q.rank === 'special').length,
    rareCount:    dishes.filter(p => p.rarity === 'rare').length,
    epicCount:    dishes.filter(p => p.rarity === 'epic').length,
    mazuCount:    extra.mazuTotal || 0,
    trashCount:   extra.trashTotal || 0,
    toolCount:    ownedTools.length,
    goldUsed:     (ownedTools.find(t => t.id === 'gold_pan')?.usedCount ?? 0) >= 1 ? 1 : 0,
    hasFenix:     !!ownedTools.find(t => t.id === 'phoenix_pan'),
    maxCombo:     extra.maxCombo || 0,
    nightCook:    extra.nightCook || 0,
    speedCook:    extra.speedCook || 0,
    allGenre:     extra.allGenre || false,
    noMazuStreak: extra.noMazuStreak || 0,
    currentYen:   yen,
    shopCount:    extra.shopCount || 0,
    trophyCount:  0,
  };
}
