# 🍳 MERGE KITCHEN - React Native App

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
# .env ファイルを作成
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

---

## TODO（今後の実装）

- [ ] AsyncStorage でデータ永続化
- [ ] AdMob 広告（react-native-google-mobile-ads + EAS build）
- [ ] ヘルプ画面
- [ ] 激まずコンボギャラリー
- [ ] レシピブック一覧
- [ ] クエストシステム拡充
- [ ] サウンドエフェクト
