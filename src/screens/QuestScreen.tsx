import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Quest, ActiveTool } from '../types';

const RANK_COLOR: Record<string, string> = { normal: '#888', rare: '#e05a00', special: '#d42b2b' };
const RANK_LABEL: Record<string, string> = { normal: 'NORMAL ¥100', rare: 'RARE ¥300', special: 'SPECIAL ¥800' };

interface Props {
  quests: Quest[];
  fetchQuest: () => void;
  questLoading: boolean;
  activeTools: ActiveTool[];
}

export default function QuestScreen({ quests, fetchQuest, questLoading, activeTools }: Props) {
  const hasApron = activeTools.some(t => t.id === 'silk_apron' || t.id === 'velvet_apron');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚔️ クエスト掲示板</Text>
          <Text style={styles.sub}>読者からのリクエスト！作ってあげたらボーナスイェンGET</Text>
        </View>
        <TouchableOpacity onPress={fetchQuest} disabled={questLoading} style={styles.fetchBtn}>
          {questLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.fetchBtnText}>📩 新着</Text>
          }
        </TouchableOpacity>
      </View>

      {hasApron && (
        <View style={styles.apronNote}>
          <Text style={styles.apronNoteText}>👘 エプロン装備中 → クエストボーナスアップ！</Text>
        </View>
      )}

      {quests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={styles.emptyText}>「新着」ボタンでリクエストを取得しよう！</Text>
        </View>
      ) : (
        quests.map(q => {
          const color = RANK_COLOR[q.rank] || '#888';
          return (
            <View key={q.id} style={[styles.questCard, { borderLeftColor: q.done ? '#ccc' : color, opacity: q.done ? 0.5 : 1 }]}>
              <View style={styles.questTop}>
                <Text style={{ fontSize: 24 }}>{q.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.request}>💬「{q.request}」</Text>
                  <Text style={styles.target}>🎯 目標：<Text style={{ fontWeight: '900' }}>{q.targetDish}</Text></Text>
                  <Text style={styles.user}>👤 {q.user}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.rank, { color, backgroundColor: `${color}22` }]}>
                    {RANK_LABEL[q.rank]}
                  </Text>
                  {q.done && <Text style={styles.done}>✅ 達成！ ¥{q.bonus}</Text>}
                </View>
              </View>
            </View>
          );
        })
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 12, gap: 10 },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, borderColor: '#e8e0d8',
    padding: 14,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  title: { fontWeight: '900', color: '#333', fontSize: 16, letterSpacing: 0.5 },
  sub: { fontSize: 11, color: '#999', marginTop: 3 },
  fetchBtn: {
    backgroundColor: '#d42b2b', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
    elevation: 3, shadowColor: '#a51e1e',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    minWidth: 60, alignItems: 'center',
  },
  fetchBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  apronNote: {
    backgroundColor: '#fff8f0', borderWidth: 1.5, borderColor: '#e05a00',
    borderRadius: 10, padding: 10,
  },
  apronNoteText: { color: '#e05a00', fontWeight: '700', fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#bbb', fontSize: 14, marginTop: 12, textAlign: 'center' },
  questCard: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: '#e8e0d8', borderLeftWidth: 4, padding: 12,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  questTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  request: { fontSize: 13, color: '#333', fontWeight: '700', marginBottom: 4 },
  target: { fontSize: 12, color: '#666', marginBottom: 2 },
  user: { fontSize: 10, color: '#aaa' },
  rank: {
    fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 50, letterSpacing: 0.5, overflow: 'hidden', marginBottom: 4,
  },
  done: { fontSize: 12, color: '#34d399', fontWeight: '700', textAlign: 'right' },
});
