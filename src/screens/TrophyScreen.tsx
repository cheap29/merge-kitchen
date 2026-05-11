import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Post, Quest, OwnedTool, ExtraStats } from '../types';
import { TROPHIES } from '../data';
import { calcStats } from '../helpers';

const CARD_W = (Dimensions.get('window').width - 24 - 20) / 3; // 3 columns

interface Props {
  earnedTrophies: string[];
  posts: Post[];
  quests: Quest[];
  ownedTools: OwnedTool[];
  yen: number;
  extra: ExtraStats;
}

export default function TrophyScreen({ earnedTrophies, posts, quests, ownedTools, yen, extra }: Props) {
  const cats = [...new Set(TROPHIES.map(t => t.cat))];
  const [selCat, setSelCat] = useState(cats[0]);
  const filtered = TROPHIES.filter(t => t.cat === selCat);
  const total = TROPHIES.length;
  const earned = earnedTrophies.length;
  const pct = Math.round(earned / total * 100);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>🏆 トロフィーコレクション</Text>
            <Text style={styles.sub}>コンプリートを目指せ！</Text>
          </View>
          <View style={styles.progress}>
            <View style={styles.fracRow}>
              <Text style={styles.earnedNum}>{earned}</Text>
              <Text style={styles.of}>/{total}</Text>
            </View>
            <Text style={styles.pct}>{pct}%</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
      </View>

      {/* カテゴリタブ */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <View style={styles.catBar}>
          {cats.map(cat => {
            const catEarned = TROPHIES.filter(t => t.cat === cat && earnedTrophies.includes(t.id)).length;
            const catTotal = TROPHIES.filter(t => t.cat === cat).length;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelCat(cat)}
                style={[styles.catBtn, selCat === cat && styles.catActive]}
              >
                <Text style={[styles.catBtnText, selCat === cat && { color: '#fff' }]}>
                  {cat} {catEarned}/{catTotal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* トロフィーグリッド */}
      <View style={styles.grid}>
        {filtered.map(t => {
          const isEarned = earnedTrophies.includes(t.id);
          return (
            <View key={t.id} style={[
              styles.trophyCard,
              { borderColor: isEarned ? '#ffd700' : '#e8e0d8', width: CARD_W },
              isEarned && styles.trophyEarned,
            ]}>
              <Text style={[styles.trophyEmoji, !isEarned && styles.trophyGray]}>{t.emoji}</Text>
              <Text style={[styles.trophyName, { color: isEarned ? '#333' : '#bbb' }]}>{t.name}</Text>
              <Text style={[styles.trophyDesc, { color: isEarned ? '#888' : '#ccc' }]}>{t.desc}</Text>
              {isEarned && <Text style={styles.trophyCheck}>✓</Text>}
            </View>
          );
        })}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 12, gap: 10 },
  header: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, borderColor: '#e8e0d8',
    padding: 16,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontWeight: '900', color: '#333', fontSize: 16, letterSpacing: 0.5 },
  sub: { fontSize: 11, color: '#999', marginTop: 2 },
  progress: { alignItems: 'flex-end' },
  fracRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  earnedNum: { fontSize: 22, fontWeight: '900', color: '#d42b2b' },
  of: { fontSize: 12, color: '#bbb' },
  pct: { fontSize: 11, color: '#e05a00', fontWeight: '700' },
  progressBar: { backgroundColor: '#f0ebe5', borderRadius: 50, height: 8, overflow: 'hidden' },
  progressFill: {
    height: '100%', borderRadius: 50,
    backgroundColor: '#d42b2b',
  },
  catScroll: { marginHorizontal: -12, paddingHorizontal: 12 },
  catBar: { flexDirection: 'row', gap: 6, paddingVertical: 4, paddingHorizontal: 2 },
  catBtn: {
    backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#e8e0d8',
    borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6,
  },
  catActive: { backgroundColor: '#e05a00', borderColor: '#e05a00' },
  catBtnText: { fontSize: 11, fontWeight: '700', color: '#999' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trophyCard: {
    borderRadius: 14, borderWidth: 2, padding: 10,
    alignItems: 'center', gap: 4, textAlign: 'center', position: 'relative',
    backgroundColor: '#faf8f5',
  },
  trophyEarned: {
    backgroundColor: '#fff',
    elevation: 3, shadowColor: '#ffd700',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.4, shadowRadius: 0,
  },
  trophyEmoji: { fontSize: 29, lineHeight: 34 },
  trophyGray: { opacity: 0.25 },
  trophyName: { fontSize: 10, fontWeight: '900', textAlign: 'center', lineHeight: 14 },
  trophyDesc: { fontSize: 9, textAlign: 'center', lineHeight: 13 },
  trophyCheck: {
    position: 'absolute', top: 4, right: 6,
    color: '#ffd700', fontSize: 12, fontWeight: '900',
  },
});
