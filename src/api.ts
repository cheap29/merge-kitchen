import { RecipeData, Reactions } from './types';
import { QUEST_GENRES, QUEST_USERS } from './data';

// ⚠️ 本番環境では必ずバックエンド経由でAPIキーを保護してください
// backend/server.js を起動し、EXPO_PUBLIC_API_URL に設定すること
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

async function callClaude(prompt: string, maxTokens: number = 500): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((b: { type: string; text: string }) => b.type === 'text')?.text || '';
  return text.replace(/```json|```/g, '').trim();
}

function safeParseJSON<T>(text: string, fallback: T): T {
  try { return JSON.parse(text); }
  catch { return fallback; }
}

// ──────────────────────────────────────────
//  マージ判定
// ──────────────────────────────────────────
export async function askAI(
  ingredients: string[],
  epicBoost: boolean = false
): Promise<{ dish: string; possible: boolean; emoji: string; rarity: string }> {
  const list = ingredients.join('、');
  const boostNote = epicBoost
    ? 'なお、このシェフは特別な包丁を持っているため、料理がepicになりやすい傾向がある。'
    : '';
  const prompt = `あなたは料理の専門家です。以下の食材を組み合わせて作れる最も一般的な料理を1つ答えてください。
${boostNote}
食材：${list}

JSONのみ（マークダウン不要）:
{"dish":"料理名","possible":true,"emoji":"絵文字1文字","rarity":"common|rare|epic"}
料理にならない場合: {"dish":"","possible":false,"emoji":"","rarity":"common"}
rarity: epic=手間かかる, rare=やや複雑, common=シンプル`;

  const text = await callClaude(prompt, 200);
  return safeParseJSON(text, { dish: '', possible: false, emoji: '', rarity: 'common' });
}

// ──────────────────────────────────────────
//  レシピ生成
// ──────────────────────────────────────────
export async function generateRecipe(dish: string, ingredients: string[]): Promise<RecipeData | null> {
  const prompt = `あなたは大阪在住の大雑把な性格のベテランママです。関西弁で話します。

「${dish}」のレシピ記事を食べログ風に書いてください。
使った食材: ${ingredients.join('、')}

JSONのみ（マークダウン不要）:
{"title":"記事タイトル","intro":"導入文（関西弁1〜2文）","ingredients":[{"name":"食材名","amount":"量","emoji":"絵文字"}],"steps":[{"step":1,"text":"手順（関西弁）","emoji":"絵文字"}],"memo":"最後のひとことメモ（関西弁2〜3文）"}

絵文字豊富に。手順3〜5ステップ。`;

  const text = await callClaude(prompt, 1000);
  return safeParseJSON<RecipeData | null>(text, null);
}

// ──────────────────────────────────────────
//  反応数生成
// ──────────────────────────────────────────
export async function generateReactions(dish: string, rarity: string): Promise<Reactions> {
  const prompt = `料理「${dish}」をレシピサイトに投稿しました。rarity=${rarity}（epic>rare>common）。

JSONのみ（マークダウン不要）:
{"fav":お気に入り数(整数),"made":作りました数(整数),"comment":"一言コメント10文字以内"}

目安: epic=fav50〜200/made10〜60, rare=fav20〜80/made5〜25, common=fav5〜30/made1〜10`;

  const text = await callClaude(prompt, 100);
  return safeParseJSON(text, { fav: 5, made: 1, comment: 'おいしそう！' });
}

// ──────────────────────────────────────────
//  クエスト生成
// ──────────────────────────────────────────
export async function generateQuest() {
  const genre = QUEST_GENRES[Math.floor(Math.random() * QUEST_GENRES.length)];
  const user  = QUEST_USERS[Math.floor(Math.random() * QUEST_USERS.length)];
  const prompt = `架空の料理レシピサイトのコメント欄に、ユーザーからリクエストが届きました。

投稿者：${user}
ジャンル指定：${genre}

このジャンルの料理を1つ選んで、そのユーザーらしいコメントでリクエストを生成してください。
肉じゃが以外の料理にしてください。毎回必ず違う料理を選んでください。

JSONのみ（マークダウン不要）:
{"request":"ユーザーの口語コメント（20文字以内、絵文字あり）","targetDish":"目標料理名（具体的に）","rank":"normal|rare|special","emoji":"料理の絵文字1文字","user":"${user}"}

rank基準: special=本格的で難しい料理, rare=やや手間かかる, normal=シンプルで作りやすい`;

  const text = await callClaude(prompt, 200);
  const q = safeParseJSON<{ request: string; targetDish: string; rank: string; emoji: string; user: string } | null>(text, null);

  if (q) {
    q.user = q.user || user;
    return q;
  }

  const fallbacks = [
    { request:'唐揚げ食べたい🍗', targetDish:'唐揚げ', rank:'normal', emoji:'🍗', user },
    { request:'パスタ作ってみたい🍝', targetDish:'ナポリタン', rank:'normal', emoji:'🍝', user },
    { request:'本格カレー挑戦したい！', targetDish:'チキンカレー', rank:'rare', emoji:'🍛', user },
    { request:'お好み焼き食べたい～', targetDish:'お好み焼き', rank:'normal', emoji:'🥞', user },
    { request:'餃子の皮から作りたい', targetDish:'餃子', rank:'rare', emoji:'🥟', user },
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
