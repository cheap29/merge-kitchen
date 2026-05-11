import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, StatusBar, Platform,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  ZenMaruGothic_700Bold,
  ZenMaruGothic_900Black,
} from '@expo-google-fonts/zen-maru-gothic';

import { FoodCard, Post, Quest, OwnedTool, ExtraStats, ActiveTool, PageName } from './src/types';
import { TROPHIES } from './src/data';
import { makeCard, makeMazu, nextId, getActiveTools, calcReactionYen, calcQuestBonus, calcStats } from './src/helpers';
import { askAI, generateRecipe, generateReactions, generateQuest } from './src/api';

import KitchenScreen from './src/screens/KitchenScreen';
import CookpadScreen from './src/screens/CookpadScreen';
import QuestScreen from './src/screens/QuestScreen';
import TrophyScreen from './src/screens/TrophyScreen';
import ShopScreen from './src/screens/ShopScreen';
import RecipeModal from './src/components/RecipeModal';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({ ZenMaruGothic_700Bold, ZenMaruGothic_900Black });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // ── ナビゲーション ──
  const [page, setPage] = useState<PageName>('kitchen');

  // ── ゲーム状態 ──
  const [yen, setYen]           = useState(300);
  const [hand, setHand]         = useState<FoodCard[]>(() =>
    ['卵', '卵', '鶏肉', '牛乳', '玉ねぎ', '小麦粉'].map(makeCard)
  );
  const [posts, setPosts]       = useState<Post[]>([]);
  const [selected, setSelected] = useState<FoodCard[]>([]);
  const [loading, setLoading]   = useState(false);
  const [aiLog, setAiLog]       = useState<{ ing: string[]; ok: boolean; dish: string; emoji: string; time: string }[]>([]);
  const [trashTarget, setTrashTarget] = useState<number | null>(null);
  const [recipeModal, setRecipeModal] = useState<Post | null>(null);
  const [quests, setQuests]     = useState<Quest[]>([]);
  const [questLoading, setQuestLoading] = useState(false);
  const [unreadQuest, setUnreadQuest]   = useState(0);
  const [ownedTools, setOwnedTools]     = useState<OwnedTool[]>([]);
  const [earnedTrophies, setEarnedTrophies] = useState<string[]>([]);
  const [newTrophy, setNewTrophy]           = useState<typeof TROPHIES[0] | null>(null);
  const [extra, setExtra] = useState<ExtraStats>({
    mazuTotal: 0, trashTotal: 0, maxCombo: 0, nightCook: 0,
    speedCook: 0, allGenre: false, noMazuStreak: 0, shopCount: 0,
    recentCookTimes: [],
  });

  // ── Toast & Pop ──
  const [toast, setToast]     = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [popText, setPopText] = useState<{ text: string; color: string } | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const popAnim   = useRef(new Animated.Value(0)).current;
  const popMoveAnim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((text: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ text, type });
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [toastAnim]);

  const showPop = useCallback((text: string, color = '#e05a00') => {
    setPopText({ text, color });
    popAnim.setValue(0);
    popMoveAnim.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(popAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(popAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(popMoveAnim, { toValue: -40, duration: 1800, useNativeDriver: true }),
    ]).start(() => setPopText(null));
  }, [popAnim, popMoveAnim]);

  const activeTools = getActiveTools(ownedTools);
  const epicBoost   = activeTools.some(t => t.epicBoost);

  // ── トロフィーチェック ──
  const checkTrophies = useCallback((
    newPosts: Post[], newQuests: Quest[], newOwned: OwnedTool[],
    newYen: number, newExtra: ExtraStats
  ) => {
    const stats = calcStats(newPosts, newQuests, newOwned, newYen, newExtra);
    stats.trophyCount = earnedTrophies.length;
    const newOnes = TROPHIES.filter(t => !earnedTrophies.includes(t.id) && t.check(stats));
    if (newOnes.length > 0) {
      setEarnedTrophies(prev => [...prev, ...newOnes.map(t => t.id)]);
      newOnes.forEach((t, i) => {
        setTimeout(() => {
          setNewTrophy(t);
          setTimeout(() => setNewTrophy(null), 3000);
        }, i * 3200);
      });
    }
  }, [earnedTrophies]);

  // ── クエスト達成チェック ──
  const checkQuestClear = useCallback((dishName: string) => {
    setQuests(prev => {
      let bonusTotal = 0;
      const next = prev.map(q => {
        if (q.done) return q;
        if (dishName === q.targetDish || dishName.includes(q.targetDish) || q.targetDish.includes(dishName)) {
          const bonus = calcQuestBonus(q.rank, activeTools);
          bonusTotal += bonus;
          return { ...q, done: true, bonus };
        }
        return q;
      });
      if (bonusTotal > 0) {
        setYen(y => y + bonusTotal);
        showPop(`クエスト達成！ ＋¥${bonusTotal}`, '#d42b2b');
        showToast(`⚔️ クエスト達成！ ¥${bonusTotal} ボーナス！`);
      }
      return next;
    });
  }, [activeTools, showPop, showToast]);

  // ── 選択 / マージ ──
  const toggleSelect = useCallback((card: FoodCard) => {
    if (card.rarity === 'mazu') {
      setTrashTarget(prev => prev === card.id ? null : card.id);
      setSelected([]);
      return;
    }
    setTrashTarget(null);
    setSelected(prev =>
      prev.find(c => c.id === card.id) ? prev.filter(c => c.id !== card.id) : [...prev, card]
    );
  }, []);

  const handleMerge = async () => {
    if (selected.length < 2) { showToast('2枚以上選んでね！', 'err'); return; }
    setLoading(true);
    try {
      const names = selected.map(c => c.name);
      const result = await askAI(names, epicBoost);
      const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      setAiLog(prev => [{ ing: names, ok: result.possible, dish: result.dish, emoji: result.emoji, time: timeStr }, ...prev].slice(0, 6));

      const usedIds = new Set(selected.map(c => c.id));
      const now = new Date();
      const isNight = now.getHours() >= 0 && now.getHours() < 5;

      if (!result.possible || !result.dish) {
        setHand(prev => [...prev.filter(c => !usedIds.has(c.id)), makeMazu(names)]);
        setSelected([]);
        showToast('🤢 激まずができた…捨てるのに¥50かかるよ', 'err');
        setExtra(prev => {
          const e = { ...prev, mazuTotal: prev.mazuTotal + 1, noMazuStreak: 0 };
          checkTrophies(posts, quests, ownedTools, yen, e);
          return e;
        });
      } else {
        const rKey = result.rarity in { common:1, rare:1, epic:1 } ? result.rarity : 'common';
        const emoji = result.emoji || '🍽️';
        setHand(prev => [...prev.filter(c => !usedIds.has(c.id)), { id: nextId(), name: result.dish, emoji, rarity: rKey as 'common' | 'rare' | 'epic' }]);
        setSelected([]);
        showToast(`${emoji} ${result.dish} 完成！投稿するで🍳`);
        checkQuestClear(result.dish);
        publishPost({ name: result.dish, emoji, rarity: rKey as 'common' | 'rare' | 'epic', ingredients: names });
        const newOwned = ownedTools.map(t => t.id === 'gold_pan' && t.usedCount < 1 ? { ...t, usedCount: t.usedCount + 1 } : t);
        setOwnedTools(newOwned);
        setExtra(prev => {
          const times = [...prev.recentCookTimes, now.getTime()].filter(t => now.getTime() - t < 60000);
          const e = {
            ...prev,
            maxCombo: Math.max(prev.maxCombo, names.length),
            nightCook: isNight ? prev.nightCook + 1 : prev.nightCook,
            speedCook: times.length >= 3 ? prev.speedCook + 1 : prev.speedCook,
            noMazuStreak: prev.noMazuStreak + 1,
            recentCookTimes: times,
          };
          checkTrophies(posts, quests, newOwned, yen, e);
          return e;
        });
      }
    } catch (e) {
      showToast('エラー、もう一回！', 'err');
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async (dish: { name: string; emoji: string; rarity: 'common' | 'rare' | 'epic'; ingredients: string[] }) => {
    const postId = nextId();
    const newPost: Post = {
      id: postId, name: dish.name, emoji: dish.emoji, rarity: dish.rarity,
      ingredients: dish.ingredients, recipeData: null, reactions: null,
      earned: 0, loading: true, postedAt: new Date(),
    };
    setPosts(prev => [newPost, ...prev]);
    try {
      const [recipeData, reactions] = await Promise.all([
        generateRecipe(dish.name, dish.ingredients),
        generateReactions(dish.name, dish.rarity),
      ]);
      const earned = calcReactionYen(reactions.fav, reactions.made, activeTools);
      setPosts(prev => {
        const next = prev.map(p => p.id === postId ? { ...p, recipeData, reactions, earned, loading: false } : p);
        checkTrophies(next, quests, ownedTools, yen + earned, extra);
        return next;
      });
      setYen(prev => prev + earned);
      showPop(`＋¥${earned}`, '#e05a00');
      showToast(`❤️${reactions.fav} 🍳${reactions.made} → ¥${earned} 獲得！`);

      // 自動クエスト生成
      generateQuest().then(q => {
        if (q) {
          setQuests(prev => [{ ...q, id: nextId(), done: false, createdAt: new Date() }, ...prev].slice(0, 5));
          setUnreadQuest(prev => prev + 1);
        }
      }).catch(() => {});
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, loading: false } : p));
    }
  };

  // ── ゴミ捨て ──
  const handleTrash = () => {
    if (yen < 50) { showToast('¥50 足りないよ💸', 'err'); return; }
    setYen(prev => prev - 50);
    setHand(prev => prev.filter(c => c.id !== trashTarget));
    setTrashTarget(null);
    showToast('🗑️ 捨てた！ ¥50 消費');
    setExtra(prev => {
      const e = { ...prev, trashTotal: prev.trashTotal + 1 };
      checkTrophies(posts, quests, ownedTools, yen - 50, e);
      return e;
    });
  };

  // ── 購入 ──
  const buyFood = (item: { name: string; emoji: string; price: number; category: string }) => {
    if (yen < item.price) { showToast('イェン足りないよ💸', 'err'); return; }
    setYen(prev => prev - item.price);
    setHand(prev => [...prev, makeCard(item.name)]);
    showToast(`${item.emoji} ${item.name} を購入！`);
    setExtra(prev => {
      const e = { ...prev, shopCount: prev.shopCount + 1 };
      checkTrophies(posts, quests, ownedTools, yen - item.price, e);
      return e;
    });
  };

  const buyTool = (tool: { id: string; name: string; emoji: string; price: number }) => {
    if (yen < tool.price) { showToast('イェン足りないよ💸', 'err'); return; }
    if (ownedTools.find(t => t.id === tool.id)) { showToast('もう持ってるで！', 'err'); return; }
    setYen(prev => prev - tool.price);
    const newOwned = [...ownedTools, { id: tool.id, usedCount: 0 }];
    setOwnedTools(newOwned);
    showToast(`${tool.emoji} ${tool.name} ゲット！`);
    checkTrophies(posts, quests, newOwned, yen - tool.price, extra);
  };

  const mazuCount = hand.filter(c => c.rarity === 'mazu').length;
  const pendingQuests = quests.filter(q => !q.done).length;

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={{ fontSize: 22 }}>🍳</Text>
            <Text style={styles.logoText}>{'MERGE\nKITCHEN'}</Text>
          </View>
          <View style={styles.nav}>
            <NavBtn emoji="🍳"  label="キッチン" active={page === 'kitchen'} onPress={() => setPage('kitchen')} />
            <NavBtn emoji={`📖${posts.length > 0 ? ` ${posts.length}` : ''}`} label="投稿" active={page === 'cookpad'} onPress={() => setPage('cookpad')} />
            <NavBtn emoji="⚔️"  label="クエスト" active={page === 'quest'}   onPress={() => { setPage('quest'); setUnreadQuest(0); }} badge={unreadQuest} />
            <NavBtn emoji={`🏆${earnedTrophies.length > 0 ? ` ${earnedTrophies.length}` : ''}`} label="トロフィー" active={page === 'trophy'} onPress={() => setPage('trophy')} />
            <NavBtn emoji="🛒"  label="ショップ" active={page === 'shop'}    onPress={() => setPage('shop')} />
          </View>
          <View style={styles.yenChip}>
            <Text style={styles.yenMark}>¥</Text>
            <Text style={styles.yenNum}>{yen}</Text>
          </View>
        </View>

        {/* メインコンテンツ */}
        <View style={styles.pageContainer}>
          {page === 'kitchen' && (
            <KitchenScreen
              hand={hand} selected={selected} toggleSelect={toggleSelect}
              handleMerge={handleMerge} loading={loading} aiLog={aiLog}
              trashTarget={trashTarget} handleTrash={handleTrash}
              yen={yen} mazuCount={mazuCount} posts={posts}
              onOpenRecipe={setRecipeModal} activeTools={activeTools}
            />
          )}
          {page === 'cookpad' && <CookpadScreen posts={posts} onOpen={setRecipeModal} />}
          {page === 'quest'   && <QuestScreen quests={quests} fetchQuest={async () => {
            if (questLoading) return;
            setQuestLoading(true);
            try {
              const q = await generateQuest();
              setQuests(prev => [{ ...q, id: nextId(), done: false, createdAt: new Date() }, ...prev].slice(0, 5));
            } catch { showToast('クエスト取得失敗', 'err'); }
            finally { setQuestLoading(false); }
          }} questLoading={questLoading} activeTools={activeTools} />}
          {page === 'trophy'  && <TrophyScreen earnedTrophies={earnedTrophies} posts={posts} quests={quests} ownedTools={ownedTools} yen={yen} extra={extra} />}
          {page === 'shop'    && <ShopScreen yen={yen} buyFood={buyFood} buyTool={buyTool} ownedTools={ownedTools} />}
        </View>
      </SafeAreaView>

      {/* Toast */}
      {toast && (
        <Animated.View style={[
          styles.toast,
          { backgroundColor: toast.type === 'ok' ? '#d42b2b' : '#444', opacity: toastAnim },
        ]}>
          <Text style={styles.toastText}>{toast.text}</Text>
        </Animated.View>
      )}

      {/* Pop (+¥xxx) */}
      {popText && (
        <Animated.View style={[
          styles.pop,
          {
            opacity: popAnim,
            transform: [{ translateY: popMoveAnim }],
          },
        ]}>
          <Text style={[styles.popText, { color: popText.color }]}>{popText.text}</Text>
        </Animated.View>
      )}

      {/* レシピモーダル */}
      <RecipeModal post={recipeModal} onClose={() => setRecipeModal(null)} />

      {/* トロフィーポップアップ */}
      {newTrophy && (
        <View style={styles.trophyPopOverlay} pointerEvents="none">
          <View style={styles.trophyPop}>
            <Text style={styles.trophyPopEmoji}>{newTrophy.emoji}</Text>
            <Text style={styles.trophyPopLabel}>トロフィー獲得！</Text>
            <Text style={styles.trophyPopName}>{newTrophy.name}</Text>
            <Text style={styles.trophyPopDesc}>{newTrophy.desc}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function NavBtn({ emoji, label, active, onPress, badge }: {
  emoji: string; label: string; active: boolean; onPress: () => void; badge?: number;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.navBtn, active && styles.navBtnActive]}>
      <Text style={[styles.navBtnText, active && { color: '#fff' }]}>{emoji}</Text>
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f4f0' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff', borderBottomWidth: 2, borderBottomColor: '#e8e0d8',
    gap: 6,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  logoText: { fontSize: 10, fontWeight: '900', color: '#d42b2b', letterSpacing: 1, lineHeight: 13 },
  nav: { flexDirection: 'row', gap: 2, flex: 1, justifyContent: 'center' },
  navBtn: {
    borderRadius: 50, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  navBtnActive: { backgroundColor: '#d42b2b' },
  navBtnText: { fontSize: 12, fontWeight: '700', color: '#666' },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ff3b30', borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900', paddingHorizontal: 2 },
  yenChip: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#fff8f0', borderWidth: 2, borderColor: '#e05a00',
    borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4,
  },
  yenMark: { color: '#e05a00', fontWeight: '900', fontSize: 13 },
  yenNum:  { color: '#e05a00', fontWeight: '900', fontSize: 15 },
  pageContainer: { flex: 1 },
  toast: {
    position: 'absolute', top: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center', borderRadius: 50,
    paddingHorizontal: 18, paddingVertical: 8,
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
    maxWidth: '90%',
  },
  toastText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  pop: {
    position: 'absolute', top: '36%', alignSelf: 'center',
    elevation: 20, pointerEvents: 'none',
  },
  popText: { fontSize: 32, fontWeight: '900' },
  trophyPopOverlay: {
    position: 'absolute', inset: 0, top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  trophyPop: {
    backgroundColor: '#fff', borderWidth: 3, borderColor: '#ffd700',
    borderRadius: 20, padding: 24, alignItems: 'center', maxWidth: 280,
    elevation: 20, shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  trophyPopEmoji: { fontSize: 48, marginBottom: 8 },
  trophyPopLabel: { fontSize: 11, fontWeight: '700', color: '#c8a400', letterSpacing: 1, marginBottom: 4 },
  trophyPopName: { fontSize: 16, fontWeight: '900', color: '#333', marginBottom: 4 },
  trophyPopDesc: { fontSize: 12, color: '#888', textAlign: 'center' },
});
