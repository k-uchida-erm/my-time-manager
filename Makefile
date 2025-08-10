# Docker関連コマンドをまとめたMakefile

# イメージ名やサービス名
SERVICE=app
CONTAINER=my-time-manager-app

# docker build
build:
	docker compose build

# docker compose up (バックグラウンド)
up:
	docker compose up -d

# docker compose down
 down:
	docker compose down

# ログ表示
logs:
	docker compose logs -f

# 再起動
restart:
	docker compose restart

# 停止
stop:
	docker compose stop

# コンテナ削除
rm:
	docker compose rm -f

# シェルで入る
shell:
	docker exec -it $(CONTAINER) sh 
