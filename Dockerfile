# ベースとなるNode.jsの公式イメージを選択
FROM node:20-alpine

# コンテナ内での作業ディレクトリを作成・指定
WORKDIR /usr/src/app

# 依存パッケージ定義を先にコピー
COPY app/package*.json ./

# 依存パッケージをインストール
RUN npm install

# アプリ本体をコピー
COPY app/ .

# ポートを公開
EXPOSE 3000

# 開発用コマンド（本番は next start などに変更）
CMD ["npm", "run", "dev"]