import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { FoodItem, ToolItem, OwnedTool } from '../types';
import { FOOD_ITEMS, TOOL_ITEMS } from '../data';

const CARD_W = (Dimensions.get('window').width - 24 - 20) / 3;

interface Props {
  yen: number;
  buyFood: (item: FoodItem) => void;
  buyTool: (tool: ToolItem) => void;
  ownedTools: OwnedTool[];
}

export default function ShopScreen({ yen, buyFood, buyTool, ownedTools }: Props) {
  const [tab, setTab] = useState<'food' | 'tool'>('food');
  const categories = [...new Set(FOOD_ITEMS.map(i => i.category))];
  const [foodCat, setFoodCat] = useState('基本');
  const filtered = FOOD_ITEMS.filter(i => i.category === foodCat);

  return (
    <View style={styles.container}>
      {/* タブ */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setTab('food')} style={[styles.tabBtn, tab === 'food' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'food' && styles.tabActiveText]}>🛒 食材</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('tool')} style={[styles.tabBtn, tab === 'tool' && styles.tabActive]}>
          <Text style={[styles.tabText, tab === 'tool' && styles.tabActiveText]}>🥄 道具</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'food' && (
          <>
            {/* カテゴリ */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.catBar}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFoodCat(cat)}
                    style={[styles.catBtn, foodCat === cat && styles.catActive]}
                  >
                    <Text style={[styles.catText, foodCat === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {/* 食材グリッド */}
            <View style={styles.foodGrid}>
              {filtered.map(item => {
                const ok = yen >= item.price;
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => buyFood(item)}
                    disabled={!ok}
                    style={[styles.foodCard, { borderColor: ok ? '#e05a00' : '#ddd', opacity: ok ? 1 : 0.38, width: CARD_W }]}
                  >
                    <Text style={styles.foodEmoji}>{item.emoji}</Text>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={[styles.foodPrice, { color: ok ? '#e05a00' : '#aaa' }]}>¥{item.price}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {tab === 'tool' && (
          <View style={styles.toolList}>
            {TOOL_ITEMS.map(tool => {
              const owned = ownedTools.find(t => t.id === tool.id);
              const usedUp = owned && tool.uses !== null && owned.usedCount >= tool.uses;
              const remaining = owned && tool.uses !== null ? tool.uses - owned.usedCount : null;
              const ok = yen >= tool.price && !owned;
              const isSpecial = tool.id === 'celestial_ladle' || tool.id === 'phoenix_pan';
              return (
                <View key={tool.id} style={[
                  styles.toolCard,
                  { borderLeftColor: owned ? (usedUp ? '#ccc' : '#34d399') : isSpecial ? '#d42b2b' : '#e8e0d8' },
                  isSpecial && styles.toolSpecial,
                  usedUp && { opacity: 0.45 },
                ]}>
                  <View style={styles.toolLeft}>
                    <Text style={{ fontSize: 29 }}>{tool.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.toolNameRow}>
                        <Text style={styles.toolName}>{tool.name}</Text>
                        {isSpecial && <Text style={styles.legendBadge}>👑</Text>}
                      </View>
                      <Text style={[styles.toolEffect, { color: isSpecial ? '#d42b2b' : '#e05a00' }]}>
                        {tool.effect}
                      </Text>
                      <Text style={styles.toolDesc}>{tool.desc}</Text>
                      {owned && remaining !== null && !usedUp && (
                        <Text style={styles.usesLeft}>残り{remaining}回</Text>
                      )}
                    </View>
                  </View>
                  <View>
                    {owned ? (
                      <View style={[styles.ownedBadge, { borderColor: usedUp ? '#ddd' : '#34d399' }]}>
                        <Text style={[styles.ownedText, { color: usedUp ? '#bbb' : '#34d399' }]}>
                          {usedUp ? '使用済み' : '所持中'}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => buyTool(tool)}
                        disabled={!ok}
                        style={[styles.buyBtn, !ok && { opacity: 0.4 }]}
                      >
                        <Text style={styles.buyBtnPrice}>¥{tool.price.toLocaleString()}</Text>
                        <Text style={styles.buyBtnLabel}>購入</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#faf8f5',
    borderBottomWidth: 2, borderBottomColor: '#e8e0d8',
  },
  tabBtn: { flex: 1, padding: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', borderBottomWidth: 2, borderBottomColor: '#d42b2b' },
  tabText: { fontWeight: '700', fontSize: 13, color: '#999' },
  tabActiveText: { color: '#d42b2b' },
  scroll: { flex: 1 },
  content: { padding: 12, gap: 12 },
  catBar: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  catBtn: {
    borderWidth: 1.5, borderColor: '#e8e0d8', borderRadius: 50,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  catActive: { backgroundColor: '#e05a00', borderColor: '#e05a00' },
  catText: { fontSize: 11, fontWeight: '700', color: '#999' },
  foodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foodCard: {
    backgroundColor: '#fff', borderWidth: 2, borderRadius: 14,
    padding: 10, alignItems: 'center', gap: 4,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  foodEmoji: { fontSize: 27 },
  foodName: { fontSize: 10, color: '#444', fontWeight: '700', textAlign: 'center' },
  foodPrice: { fontSize: 13, fontWeight: '900' },
  toolList: { gap: 10 },
  toolCard: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: '#e8e0d8', borderLeftWidth: 4, padding: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    elevation: 2, shadowColor: '#e8e0d8',
    shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  toolSpecial: { backgroundColor: '#fff8f8' },
  toolLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  toolNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  toolName: { fontWeight: '900', color: '#333', fontSize: 14 },
  legendBadge: { fontSize: 11 },
  toolEffect: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  toolDesc: { fontSize: 10, color: '#888' },
  usesLeft: { fontSize: 10, color: '#e05a00', fontWeight: '700', marginTop: 2 },
  buyBtn: {
    backgroundColor: '#d42b2b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center', gap: 2,
    elevation: 3, shadowColor: '#a51e1e',
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  buyBtnPrice: { color: '#fff', fontSize: 13, fontWeight: '900' },
  buyBtnLabel: { color: '#fff', fontSize: 10 },
  ownedBadge: {
    borderWidth: 1.5, borderRadius: 50,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  ownedText: { fontSize: 11, fontWeight: '700' },
});
