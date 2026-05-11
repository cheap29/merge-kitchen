import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Post } from '../types';
import { RARITY } from '../data';

interface Props {
  post: Post;
  onOpen: () => void;
}

export default function PostCard({ post, onOpen }: Props) {
  const r = RARITY[post.rarity] || RARITY.common;
  const timeStr = post.postedAt
    ? post.postedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[styles.card, { borderLeftColor: r.color }]}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={styles.dishEmoji}>{post.emoji}</Text>
          <View style={styles.titleBlock}>
            <Text style={styles.dishName}>{post.name}</Text>
            <View style={styles.meta}>
              <Text style={[styles.rarityPill, { color: r.color, backgroundColor: r.bg }]}>
                {r.label}
              </Text>
              <Text style={styles.timeText}>{timeStr}</Text>
            </View>
          </View>
        </View>
        {post.loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#e05a00" />
            <Text style={styles.loadingText}>投稿中…</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={onOpen} style={styles.recipeBtn}>
            <Text style={styles.recipeBtnText}>📖 レシピ</Text>
          </TouchableOpacity>
        )}
      </View>

      {!post.loading && post.reactions && (
        <View style={styles.reactions}>
          <View style={styles.reactionChip}>
            <Text style={styles.reactionNum}>❤️ {post.reactions.fav}</Text>
            <Text style={styles.reactionLabel}>お気に入り</Text>
          </View>
          <View style={styles.reactionChip}>
            <Text style={styles.reactionNum}>🍳 {post.reactions.made}</Text>
            <Text style={styles.reactionLabel}>作りました</Text>
          </View>
          {post.reactions.comment ? (
            <Text style={styles.comment} numberOfLines={1}>
              💬「{post.reactions.comment}」
            </Text>
          ) : null}
          <View style={styles.earnedChip}>
            <Text style={styles.earnedText}>＋¥{post.earned}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8e0d8',
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 2,
    elevation: 2,
    shadowColor: '#e8e0d8',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dishEmoji: { fontSize: 22 },
  titleBlock: { flex: 1 },
  dishName: { fontWeight: '900', color: '#333', fontSize: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rarityPill: {
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 50,
    letterSpacing: 0.5,
    overflow: 'hidden',
  },
  timeText: { fontSize: 10, color: '#bbb' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loadingText: { fontSize: 10, color: '#bbb' },
  recipeBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d42b2b',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  recipeBtnText: { fontSize: 10, fontWeight: '700', color: '#d42b2b' },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#faf8f5',
    borderWidth: 1,
    borderColor: '#e8e0d8',
    borderRadius: 50,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  reactionNum: { fontWeight: '900', color: '#333', fontSize: 13 },
  reactionLabel: { fontSize: 9, color: '#888' },
  comment: { fontSize: 10, color: '#888', flex: 1, minWidth: 0 },
  earnedChip: {
    marginLeft: 'auto',
    backgroundColor: '#fff8f0',
    borderWidth: 1.5,
    borderColor: '#e05a00',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  earnedText: { fontWeight: '900', color: '#e05a00', fontSize: 13 },
});
