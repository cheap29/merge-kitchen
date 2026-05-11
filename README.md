# 🍳 MERGE KITCHEN

> 食材を組み合わせてマージするだけで、AIがその場で料理を生成するスマホゲームです。

「何ができる？」のワクワク感を、料理テーマのマージゲームで実現しました。食材を2つ以上選んで「つくる！」を押すと、Claude AIが組み合わせから料理名・レシピ・レアリティを判定します。料理ジャンルを変えれば他テーマへの展開も想定しています。

---

## 画面構成

| 画面 | 内容 |
|------|------|
| 🧊 キッチン | 冷蔵庫の食材を選んでマージ。マージログで結果を確認 |
| 📣 クックパッド | 生成した料理の投稿フィード。レシピをモーダルで確認 |
| ⚔️ クエスト | ランダム発行のお題をクリアしてイェンボーナス獲得 |
| 🏆 トロフィー | 料理数・イェン・レアリティなど50種類の実績 |
| 🛒 ショップ | 食材購入と特殊道具（倍率・EPIC率・激まず防止）の購入 |

---

## ゲームの仕組み

- **食材** — 60種類以上（基本・野菜・魚介・調味料・穀物・エスニック）
- **レアリティ** — COMMON / RARE / EPIC / 激まず の4段階
- **通貨（イェン）** — 料理生成・クエスト達成で獲得。道具購入や激まず廃棄に使用
- **道具** — 反応イェン倍率・EPIC排出率・激まず防止など14種類

---

## 完成度

| 機能 | 状態 |
|------|------|
| コアゲームループ（マージ・生成・ログ） | ✅ 完成 |
| クエストシステム | ✅ 基本実装済み |
| トロフィー（50種） | ✅ 完成 |
| ショップ・道具システム | ✅ 完成 |
| データ永続化（AsyncStorage） | 🚧 未実装（再起動でリセット） |
| サウンドエフェクト | 🚧 未実装 |
| 広告（AdMob） | 🚧 未実装 |
| ヘルプ画面 | 🚧 未実装 |

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | React Native（Expo） |
| 言語 | TypeScript |
| AI | Anthropic Claude（料理生成・レアリティ判定） |
| バックエンド | Node.js + Express |
| ビルド | EAS（Expo Application Services） |

---

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
cd merge-kitchen
npm install
```

### 2. バックエンドのセットアップ

```bash
cd backend
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 4. バックエンド起動

```bash
cd backend
ANTHROPIC_API_KEY=sk-ant-あなたのAPIキー node server.js
# Windows の場合:
# set ANTHROPIC_API_KEY=sk-ant-あなたのAPIキー && node server.js
```

### 5. アプリ起動（別ターミナル）

```bash
cd merge-kitchen
npx expo start --android
```

---

<img width="1048" height="875" alt="image" src="https://github.com/user-attachments/assets/f5e4a244-be49-40ba-b23f-3c78db633f90" />

<img width="1060" height="951" alt="image" src="https://github.com/user-attachments/assets/d1d4f61c-86a5-45e5-9106-407d4c39f575" />

<img width="1063" height="792" alt="image" src="https://github.com/user-attachments/assets/f59b9ace-efaf-4227-ba5d-e754f9d9e180" />

<img width="1066" height="651" alt="image" src="https://github.com/user-attachments/assets/dab5605c-ed13-40b8-90fa-005cd1fab1f5" />


---
## Google Play 公開手順

### 1. EAS CLI インストール
```bash
npm install -g eas-cli
eas login
```

### 2. プロジェクト設定
`app.json` の以下を変更:
- `android.package` → `com.yourname.mergekitchen` を任意のパッケージ名に

### 3. APK（テスト用）ビルド
```bash
eas build --platform android --profile preview
```

### 4. AAB（本番）ビルド
```bash
eas build --platform android --profile production
```

### 5. ストア申請
```bash
eas submit --platform android
```

---

## バックエンドのデプロイ（本番）

本番公開時はバックエンドを以下のサービスにデプロイしてください：
- [Railway](https://railway.app) - 無料プランあり
- [Render](https://render.com) - 無料プランあり
- [Vercel Serverless Functions](https://vercel.com) - 無料プランあり

デプロイ後、`app.json` の `extra.apiUrl` をデプロイ先URLに変更するか、
`.env` の `EXPO_PUBLIC_API_URL` を更新してください。
