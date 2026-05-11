import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Post } from '../types';
import PostCard from '../components/PostCard';

interface Props {
  posts: Post[];
  onOpen: (post: Post) => void;
}

export default function CookpadScreen({ posts, onOpen }: Props) {
  const totalYen = posts.reduce((s, p) => s + (p.earned || 0), 0);
  const totalFav = posts.reduce((s, p) => s + (p.reactions?.fav || 0), 0);
  const totalMade = posts.reduce((s, p) => s + (p.reactions?.made || 0), 0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.siteRow}>
          <Text style={{ fontSize: 24 }}>🍴</Text>
          <View>
            <Text style={styles.siteName}>マージクックパッド</Text>
            <Text style={styles.siteSub}>レシピママの料理記録</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <StatItem num={posts.length} label="投稿" />
          <View style={styles.divider} />
          <StatItem num={totalFav} label="❤️" />
          <View style={styles.divider} />
          <StatItem num={totalMade} label="🍳作った" />
          <View style={styles.divider} />
          <StatItem num={`¥${totalYen}`} label="獲得" orange />
        </View>
      </View>

      {posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🍽️</Text>
          <Text style={styles.emptyText}>まだ投稿がないよ！{'\n'}キッチンで料理を作ってみよう</Text>
        </View>
      ) : (
        <View style={styles.postList}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onOpen={() => onOpen(post)} />
          ))}
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function StatItem({ num, label, orange }: { num: number | string; label: string; orange?: boolean }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statNum, orange && { color: '#e05a00' }]}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 12, gap: 10 },
  header: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 2,
    borderColor: '#e8e0d8', padding: 14,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  siteRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  siteName: { fontWeight: '900', color: '#d42b2b', fontSize: 15, letterSpacing: 0.5 },
  siteSub: { fontSize: 10, color: '#999' },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: 12 },
  statNum: { fontWeight: '900', color: '#333', fontSize: 16 },
  statLabel: { fontSize: 9, color: '#999' },
  divider: { width: 1, height: 28, backgroundColor: '#e8e0d8' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: '#bbb', fontSize: 14, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  postList: { gap: 10 },
});
