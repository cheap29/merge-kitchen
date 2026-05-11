import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Post } from '../types';
import { RARITY } from '../data';

interface Props {
  post: Post | null;
  onClose: () => void;
}

export default function RecipeModal({ post, onClose }: Props) {
  if (!post) return null;
  const r = RARITY[post.rarity] || RARITY.common;
  const data = post.recipeData;

  return (
    <Modal
      visible={!!post}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ヘッダー */}
        <View style={[styles.header, { borderBottomColor: r.color }]}>
          <View style={styles.titleRow}>
            <Text style={styles.dishEmoji}>{post.emoji}</Text>
            <View>
              <Text style={[styles.dishName, { color: r.color }]}>{post.name}</Text>
              <Text style={[styles.rarity, { color: r.color, backgroundColor: r.bg }]}>
                {r.label}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 反応 */}
        {post.reactions && (
          <View style={styles.reactions}>
            <Text style={styles.react}>❤️ {post.reactions.fav}</Text>
            <Text style={styles.react}>🍳 {post.reactions.made} 作りました</Text>
            {post.reactions.comment ? (
              <Text style={styles.reactComment}>💬「{post.reactions.comment}」</Text>
            ) : null}
            <Text style={[styles.earned, { color: r.color }]}>＋¥{post.earned}</Text>
          </View>
        )}

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {!data ? (
            <View style={styles.loading}>
              <Text style={styles.cookingEmoji}>👩‍🍳</Text>
              <Text style={styles.loadingText}>レシピママが書いてるで〜{'\n'}ちょっと待ってや！</Text>
              <ActivityIndicator size="large" color="#e05a00" style={{ marginTop: 16 }} />
            </View>
          ) : (
            <>
              <Text style={styles.recipeTitle}>{data.title}</Text>
              <View style={styles.authorRow}>
                <View style={styles.authorAvatar}><Text style={{ fontSize: 22 }}>👩‍🍳</Text></View>
                <View>
                  <Text style={styles.authorName}>レシピママ</Text>
                  <Text style={styles.authorSub}>いつも大雑把やけど美味しいで！</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.intro}>{data.intro}</Text>

              <Text style={styles.sectionLabel}>🛒 材料</Text>
              {data.ingredients?.map((ing, i) => (
                <View key={i} style={styles.ingRow}>
                  <Text style={styles.ingEmoji}>{ing.emoji}</Text>
                  <Text style={styles.ingName}>{ing.name}</Text>
                  <Text style={styles.ingAmount}>{ing.amount}</Text>
                </View>
              ))}

              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>📝 作り方</Text>
              {data.steps?.map((st, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>{st.step}</Text></View>
                  <Text style={styles.stepEmoji}>{st.emoji}</Text>
                  <Text style={styles.stepText}>{st.text}</Text>
                </View>
              ))}

              <View style={styles.divider} />
              <View style={styles.memoBox}>
                <Text style={styles.memoLabel}>💬 レシピママのひとことメモ</Text>
                <Text style={styles.memoText}>{data.memo}</Text>
              </View>
              <View style={{ height: 40 }} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 3,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dishEmoji: { fontSize: 32 },
  dishName: { fontSize: 19, fontWeight: '900', letterSpacing: 0.5 },
  rarity: {
    fontSize: 10, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 2,
    borderRadius: 50, marginTop: 3, overflow: 'hidden', alignSelf: 'flex-start',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f0eb',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#666', fontSize: 14 },
  reactions: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 8, paddingHorizontal: 16, backgroundColor: '#faf8f5',
    borderBottomWidth: 1, borderBottomColor: '#e8e0d8', flexWrap: 'wrap',
  },
  react: { fontSize: 11, fontWeight: '700', color: '#444' },
  reactComment: { fontSize: 11, color: '#888', flex: 1 },
  earned: { fontWeight: '900', fontSize: 13, marginLeft: 'auto' },
  body: { flex: 1, padding: 16 },
  loading: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  cookingEmoji: { fontSize: 40, marginBottom: 12 },
  loadingText: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 24 },
  recipeTitle: { fontSize: 17, fontWeight: '900', color: '#333', marginBottom: 12, lineHeight: 24 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  authorAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff0f0', alignItems: 'center', justifyContent: 'center',
  },
  authorName: { fontWeight: '700', color: '#333', fontSize: 13 },
  authorSub: { fontSize: 10, color: '#999' },
  divider: { height: 1, backgroundColor: '#f0ebe5', marginVertical: 12 },
  intro: { color: '#555', fontSize: 14, lineHeight: 24, marginBottom: 14 },
  sectionLabel: { fontWeight: '900', color: '#333', fontSize: 13, letterSpacing: 0.5, marginBottom: 8 },
  ingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#faf8f5', borderRadius: 9, padding: 7, marginBottom: 5,
  },
  ingEmoji: { fontSize: 16 },
  ingName: { flex: 1, color: '#333', fontSize: 13, fontWeight: '700' },
  ingAmount: { color: '#888', fontSize: 12 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 9 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#d42b2b', alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  stepNumText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  stepEmoji: { fontSize: 16, lineHeight: 24 },
  stepText: { color: '#444', fontSize: 13, lineHeight: 22, flex: 1 },
  memoBox: {
    backgroundColor: '#fff8f0', borderWidth: 2, borderColor: '#ffd6a5',
    borderRadius: 12, padding: 12,
  },
  memoLabel: { fontWeight: '900', color: '#e05a00', fontSize: 13, marginBottom: 6 },
  memoText: { color: '#555', fontSize: 13, lineHeight: 22 },
});
