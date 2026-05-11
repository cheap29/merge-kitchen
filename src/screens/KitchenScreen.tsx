import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { FoodCard, Post, ActiveTool } from '../types';
import { RARITY, TOOL_ITEMS } from '../data';
import PostCard from '../components/PostCard';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 24 - 32) / 4; // 12px padding x2, 4 items, 8px gap x3

interface Props {
  hand: FoodCard[];
  selected: FoodCard[];
  toggleSelect: (card: FoodCard) => void;
  handleMerge: () => void;
  loading: boolean;
  aiLog: { ing: string[]; ok: boolean; dish: string; emoji: string; time: string }[];
  trashTarget: number | null;
  handleTrash: () => void;
  yen: number;
  mazuCount: number;
  posts: Post[];
  onOpenRecipe: (post: Post) => void;
  activeTools: ActiveTool[];
}

export default function KitchenScreen({
  hand, selected, toggleSelect, handleMerge, loading, aiLog,
  trashTarget, handleTrash, yen, mazuCount, posts, onOpenRecipe, activeTools,
}: Props) {
  const hasMazu = !!trashTarget;
  const canMerge = !loading && selected.length >= 2;
  const canTrash = yen >= 50;
  const latestPost = posts[0];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 道具バッジ */}
        {activeTools.length > 0 && (
          <View style={styles.toolBar}>
            {activeTools.map(t => {
              const isGold = t.id === 'gold_pan';
              return (
                <View key={t.id} style={[styles.toolChip, { borderColor: isGold ? '#c8a400' : '#e8e0d8' }]}>
                  <Text style={{ fontSize: 14 }}>{t.emoji}</Text>
                  <Text style={[styles.toolEffect, { color: isGold ? '#c8a400' : '#888' }]}>{t.effect}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 冷蔵庫 */}
        <View style={styles.section}>
          <View style={styles.secRow}>
            <Text style={styles.secIcon}>🧊</Text>
            <Text style={styles.secTitle}>冷蔵庫</Text>
            <View style={styles.secCount}><Text style={styles.secCountText}>{hand.length}個</Text></View>
            {mazuCount > 0 && (
              <View style={styles.mazuBadge}><Text style={styles.mazuBadgeText}>🤢×{mazuCount}</Text></View>
            )}
          </View>
          <View style={styles.grid}>
            {hand.map(card => {
              const isSel = !!selected.find(c => c.id === card.id);
              const isTrash = card.id === trashTarget;
              const isMazu = card.rarity === 'mazu';
              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => !loading && toggleSelect(card)}
                  activeOpacity={0.75}
                  style={[
                    styles.card,
                    isMazu && styles.mazuCard,
                    isSel && styles.cardSel,
                    isTrash && styles.trashSel,
                    loading && { opacity: 0.5 },
                    { width: CARD_W },
                  ]}
                >
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                  <Text style={[
                    styles.cardName,
                    isSel && { color: '#d42b2b' },
                    isTrash && { color: '#c8a400' },
                    isMazu && { color: '#7a5c00' },
                  ]}>
                    {card.name}
                  </Text>
                  {isMazu && card.desc ? (
                    <Text style={styles.mazuSub}>{card.desc}</Text>
                  ) : null}
                  {(isSel || isTrash) && (
                    <View style={[styles.selDot, { backgroundColor: isTrash ? '#c8a400' : '#d42b2b' }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 最新投稿 */}
        {latestPost && (
          <View>
            <Text style={styles.latestLabel}>📣 最新投稿</Text>
            <PostCard post={latestPost} onOpen={() => onOpenRecipe(latestPost)} />
          </View>
        )}

        {/* マージログ */}
        <View style={styles.logBox}>
          <Text style={styles.logTitle}>📋 マージログ</Text>
          {aiLog.length === 0
            ? <Text style={styles.emptyText}>まだログなし</Text>
            : aiLog.map((log, i) => (
              <View key={i} style={styles.logRow}>
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logIng} numberOfLines={1}>{log.ing.join('＋')}</Text>
                <Text style={styles.logArr}>→</Text>
                <Text style={[styles.logRes, { color: log.ok ? '#d42b2b' : '#bbb' }]}>
                  {log.ok ? `${log.emoji}${log.dish}` : '🤢激まず'}
                </Text>
              </View>
            ))
          }
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* アクションバー（画面下部固定） */}
      <View style={styles.actionBar}>
        {hasMazu ? (
          <View style={styles.trashBar}>
            <View style={styles.trashInfo}>
              <Text style={{ fontSize: 22 }}>🗑️</Text>
              <View>
                <Text style={styles.trashTitle}>激まず を捨てる</Text>
                <Text style={styles.trashSub}>¥50 かかります</Text>
              </View>
            </View>
            <View style={styles.trashBtns}>
              <TouchableOpacity
                onPress={() => toggleSelect({ id: trashTarget!, name: '', emoji: '', rarity: 'mazu' })}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTrash}
                disabled={!canTrash}
                style={[styles.trashBtn, { opacity: canTrash ? 1 : 0.4 }]}
              >
                <Text style={styles.trashBtnText}>🗑️ 捨てる ¥50</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.mergeBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selPreview}
              contentContainerStyle={styles.selPreviewContent}
            >
              {selected.length === 0
                ? <Text style={styles.selHint}>食材を選んでね</Text>
                : selected.map(c => (
                  <View key={c.id} style={styles.selChip}>
                    <Text style={styles.selChipText}>{c.emoji}{c.name}</Text>
                  </View>
                ))
              }
            </ScrollView>
            <TouchableOpacity
              onPress={handleMerge}
              disabled={!canMerge}
              style={[styles.mergeBtn, { opacity: canMerge ? 1 : 0.38 }]}
            >
              <Text style={styles.mergeBtnText}>{loading ? '⏳判定中' : '🍳 つくる！'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 10 },

  toolBar: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  toolChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderWidth: 1.5, borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  toolEffect: { fontSize: 11 },

  section: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 2,
    borderColor: '#e8e0d8', padding: 12,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  secIcon: { fontSize: 18 },
  secTitle: { fontWeight: '900', color: '#333', fontSize: 15, letterSpacing: 0.5 },
  secCount: {
    marginLeft: 'auto', backgroundColor: '#f5f0eb',
    paddingHorizontal: 9, paddingVertical: 2, borderRadius: 50,
  },
  secCountText: { fontSize: 11, color: '#999', fontWeight: '700' },
  mazuBadge: {
    backgroundColor: '#fffbe6', borderWidth: 1, borderColor: '#c8a400',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 50,
  },
  mazuBadgeText: { fontSize: 10, color: '#7a5c00', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    backgroundColor: '#faf8f5', borderWidth: 2, borderColor: '#e8e0d8',
    borderRadius: 13, padding: 8, alignItems: 'center', gap: 3,
    minHeight: 72, position: 'relative',
  },
  cardSel: {
    backgroundColor: '#fff0f0', borderColor: '#d42b2b',
    elevation: 3, shadowColor: '#d42b2b',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.5, shadowRadius: 0,
  },
  mazuCard: { backgroundColor: '#fffbe6', borderColor: '#c8a400' },
  trashSel: {
    backgroundColor: '#fffbe6', borderColor: '#c8a400',
    elevation: 3, shadowColor: '#c8a400',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.5, shadowRadius: 0,
  },
  cardEmoji: { fontSize: 24, lineHeight: 28 },
  cardName: { fontSize: 9, fontWeight: '700', textAlign: 'center', color: '#444', lineHeight: 13 },
  mazuSub: { fontSize: 8, color: '#999', textAlign: 'center' },
  selDot: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4,
  },

  latestLabel: { fontSize: 11, fontWeight: '700', color: '#e05a00', marginBottom: 5, letterSpacing: 0.5 },

  logBox: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 2,
    borderColor: '#e8e0d8', padding: 12,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  logTitle: { fontWeight: '900', color: '#333', fontSize: 13, marginBottom: 8 },
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    padding: 5, backgroundColor: '#faf8f5', borderRadius: 8,
  },
  logTime: { color: '#bbb', fontSize: 10, flexShrink: 0 },
  logIng: { color: '#666', flex: 1, fontSize: 10 },
  logArr: { color: '#e05a00', flexShrink: 0, fontSize: 10 },
  logRes: { fontWeight: '700', flexShrink: 0, fontSize: 10 },
  emptyText: { color: '#ccc', fontSize: 12, fontStyle: 'italic' },

  actionBar: {
    backgroundColor: '#fff', borderTopWidth: 2, borderTopColor: '#e8e0d8',
    padding: 12, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  mergeBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selPreview: { flex: 1, maxHeight: 44 },
  selPreviewContent: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 4 },
  selHint: { color: '#ccc', fontSize: 12, fontStyle: 'italic' },
  selChip: {
    backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#d42b2b',
    borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3,
  },
  selChipText: { color: '#d42b2b', fontSize: 11, fontWeight: '700' },
  mergeBtn: {
    backgroundColor: '#d42b2b', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14,
    elevation: 4, shadowColor: '#a51e1e',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
  },
  mergeBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  trashBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trashInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  trashTitle: { fontWeight: '900', color: '#7a5c00', fontSize: 15 },
  trashSub: { fontSize: 11, color: '#b08020' },
  trashBtns: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    backgroundColor: '#f5f5f5', borderWidth: 2, borderColor: '#ddd',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
  },
  cancelBtnText: { color: '#888', fontWeight: '700', fontSize: 12 },
  trashBtn: {
    backgroundColor: '#c8a400', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    elevation: 3, shadowColor: '#9a7c00',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  trashBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
});
