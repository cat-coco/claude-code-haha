# Claude Code Blog 部署文档

> 技术栈: Spring Boot 3.2.5 + MySQL 8.0 + Redis 7 + React 18 / Vite 5 + Nginx
> 目标环境: 阿里云 ECS (Ubuntu 22.04)

---

## 1. 服务器环境准备

### 推荐配置

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 系统盘 | 40 GB SSD | 80 GB SSD |
| 带宽 | 3 Mbps | 5 Mbps |
| 系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 安全组规则

在阿里云控制台 -> ECS -> 安全组，添加以下入方向规则:

| 端口 | 协议 | 来源 | 说明 |
|------|------|------|------|
| 22 | TCP | 你的IP/32 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 3306 | TCP | 127.0.0.1 | MySQL (仅本地) |

### 初始化服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 设置时区
sudo timedatectl set-timezone Asia/Shanghai

# 创建部署用户
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/deploy

# 创建项目目录
sudo mkdir -p /opt/claude-code-blog/{backend,frontend,uploads,logs,backup}
sudo chown -R deploy:deploy /opt/claude-code-blog
```

---

## 2. 基础环境安装

### JDK 17

```bash
sudo apt install -y openjdk-17-jdk
java -version
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' | sudo tee /etc/profile.d/java.sh
source /etc/profile.d/java.sh
```

### Maven

```bash
sudo apt install -y maven
mvn -version
```

### MySQL 8.0

```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql

# 安全初始化
sudo mysql_secure_installation

# 创建数据库和用户
sudo mysql -u root <<'SQL'
CREATE DATABASE claude_code_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ccblog'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON claude_code_blog.* TO 'ccblog'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### Redis 7

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server

# 设置密码 (可选)
sudo sed -i 's/# requirepass foobared/requirepass YourRedisPassword/' /etc/redis/redis.conf
sudo systemctl restart redis-server
```

### Node.js 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

### Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## 3. 数据库初始化

```bash
# 将项目中的 SQL 文件复制到服务器后执行
mysql -u ccblog -p'YourStrongPassword123!' claude_code_blog < backend/src/main/resources/schema.sql
mysql -u ccblog -p'YourStrongPassword123!' claude_code_blog < backend/src/main/resources/data.sql

# 验证
mysql -u ccblog -p'YourStrongPassword123!' claude_code_blog -e "SHOW TABLES;"
```

---

## 4. 后端部署

### 编译打包

```bash
cd /opt/claude-code-blog/backend
# 将后端源码上传到此目录后执行
mvn clean package -DskipTests -B
# 产物: target/claude-code-blog-1.0.0.jar
```

### 生产环境配置

创建 `/opt/claude-code-blog/backend/application-prod.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/claude_code_blog?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8mb4
    username: ccblog
    password: YourStrongPassword123!
  data:
    redis:
      host: localhost
      port: 6379
      # password: YourRedisPassword

app:
  jwt-secret: your-production-jwt-secret-min-32-chars
  upload-path: /opt/claude-code-blog/uploads
```

### Systemd 服务

创建 `/etc/systemd/system/ccblog.service`:

```ini
[Unit]
Description=Claude Code Blog Backend
After=network.target mysql.service redis-server.service

[Service]
Type=simple
User=deploy
Group=deploy
WorkingDirectory=/opt/claude-code-blog/backend
ExecStart=/usr/bin/java \
  -Xms512m -Xmx1024m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Dspring.profiles.active=prod \
  -Dspring.config.additional-location=file:./application-prod.yml \
  -Dfile.encoding=UTF-8 \
  -jar target/claude-code-blog-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=append:/opt/claude-code-blog/logs/backend.log
StandardError=append:/opt/claude-code-blog/logs/backend-error.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ccblog
sudo systemctl start ccblog
sudo systemctl status ccblog

# 验证
curl http://localhost:8080/api/articles?page=1&size=5
```

---

## 5. 前端部署

```bash
cd /opt/claude-code-blog/frontend

# 安装依赖
npm install

# 修改 API 地址为生产域名 (如 vite.config.js 中有 proxy 配置则无需修改，Nginx 会代理)
# 编译
npm run build

# 复制产物到 Nginx 目录
sudo rm -rf /var/www/ccblog
sudo mkdir -p /var/www/ccblog
sudo cp -r dist/* /var/www/ccblog/
sudo chown -R www-data:www-data /var/www/ccblog
```

---

## 6. Nginx 配置

创建 `/etc/nginx/sites-available/ccblog.conf`:

```nginx
upstream backend_api {
    server 127.0.0.1:8080;
    keepalive 32;
}

server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ccblog;
    index index.html;
    client_max_body_size 20m;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # 前端 SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend_api/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_read_timeout 120s;
        proxy_send_timeout 30s;
    }

    # 上传文件
    location /uploads/ {
        alias /opt/claude-code-blog/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # 健康检查
    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ccblog.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. HTTPS 配置

### 使用 Let's Encrypt (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# 按提示输入邮箱，同意协议即可

# 验证自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改 Nginx 配置添加 SSL 和 HTTP -> HTTPS 重定向。如需手动配置:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... 其余配置同第 6 节 ...
}
```

---

## 8. 备份策略

创建 `/opt/claude-code-blog/backup/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/claude-code-blog/backup"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="claude_code_blog"
DB_USER="ccblog"
DB_PASS="YourStrongPassword123!"
KEEP_DAYS=7

# 数据库备份
mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# 上传文件备份
tar czf "$BACKUP_DIR/uploads_${DATE}.tar.gz" -C /opt/claude-code-blog uploads

# 清理过期备份
find "$BACKUP_DIR" -name "*.gz" -mtime +$KEEP_DAYS -delete

echo "[$(date)] Backup completed: db_${DATE}.sql.gz"
```

```bash
chmod +x /opt/claude-code-blog/backup/backup.sh

# 添加定时任务: 每天凌晨 3 点执行
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/claude-code-blog/backup/backup.sh >> /opt/claude-code-blog/logs/backup.log 2>&1") | crontab -
```

---

## 9. 监控运维

### 服务管理

```bash
# 后端服务
sudo systemctl start ccblog
sudo systemctl stop ccblog
sudo systemctl restart ccblog
sudo systemctl status ccblog

# 查看日志
tail -f /opt/claude-code-blog/logs/backend.log
tail -100 /opt/claude-code-blog/logs/backend-error.log

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 健康检查脚本

创建 `/opt/claude-code-blog/healthcheck.sh`:

```bash
#!/bin/bash
API_URL="http://localhost:8080/api/articles?page=1&size=1"
NOTIFY_EMAIL="admin@your-domain.com"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" --max-time 10)

if [ "$HTTP_CODE" != "200" ]; then
    echo "[$(date)] Health check FAILED (HTTP $HTTP_CODE), restarting..." >> /opt/claude-code-blog/logs/healthcheck.log
    sudo systemctl restart ccblog
fi
```

```bash
chmod +x /opt/claude-code-blog/healthcheck.sh

# 每 5 分钟检查一次
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/claude-code-blog/healthcheck.sh") | crontab -
```

### 常用排查命令

```bash
# 磁盘/内存/CPU
df -h && free -h && top -bn1 | head -5

# 端口占用
ss -tlnp | grep -E '80|443|8080|3306|6379'

# Java 进程
ps aux | grep java
jstat -gcutil $(pgrep -f claude-code-blog) 1000 5
```

---

## 10. Docker 部署方案

项目根目录已提供 `docker-compose.yml`，包含 MySQL 8.0、Redis 7、Spring Boot 后端、Nginx 四个服务。

### 安装 Docker

```bash
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker deploy
sudo apt install -y docker-compose-plugin

# 配置阿里云镜像加速 (在阿里云容器镜像服务控制台获取你的加速地址)
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://your-id.mirror.aliyuncs.com"]
}
EOF
sudo systemctl restart docker
```

### 部署

```bash
cd /path/to/claude-code-blog

# 先构建前端产物 (Nginx 容器需要 dist 目录)
cd frontend && npm install && npm run build && cd ..

# 设置环境变量
export MYSQL_ROOT_PASSWORD="YourStrongPassword123!"
export JWT_SECRET="your-production-jwt-secret-min-32-chars"

# 启动所有服务
docker compose up -d

# 查看状态
docker compose ps
docker compose logs -f backend
```

### 常用操作

```bash
# 重启单个服务
docker compose restart backend

# 更新后端
docker compose build backend && docker compose up -d backend

# 停止所有服务
docker compose down

# 停止并清除数据卷 (谨慎!)
docker compose down -v
```

---

## 11. 一键部署脚本

创建 `deploy.sh` (放在项目根目录):

```bash
#!/bin/bash
set -e

APP_DIR="/opt/claude-code-blog"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===== Claude Code Blog 部署脚本 ====="
echo "项目目录: $PROJECT_DIR"
echo "部署目录: $APP_DIR"
echo ""

# 1. 编译后端
echo "[1/5] 编译后端..."
cd "$PROJECT_DIR/backend"
mvn clean package -DskipTests -B -q
cp target/claude-code-blog-1.0.0.jar "$APP_DIR/backend/"
cp -n application-prod.yml "$APP_DIR/backend/" 2>/dev/null || true

# 2. 编译前端
echo "[2/5] 编译前端..."
cd "$PROJECT_DIR/frontend"
npm install --silent
npm run build

# 3. 部署前端
echo "[3/5] 部署前端静态文件..."
sudo rm -rf /var/www/ccblog/*
sudo cp -r dist/* /var/www/ccblog/
sudo chown -R www-data:www-data /var/www/ccblog

# 4. 重启后端
echo "[4/5] 重启后端服务..."
sudo systemctl restart ccblog

# 5. 重载 Nginx
echo "[5/5] 重载 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 等待后端启动
echo ""
echo "等待后端启动..."
for i in $(seq 1 30); do
    if curl -s -o /dev/null http://localhost:8080/api/articles?page=1&size=1 --max-time 2; then
        echo "部署完成! 后端已启动。"
        exit 0
    fi
    sleep 2
done

echo "警告: 后端未在 60 秒内响应，请检查日志:"
echo "  tail -f $APP_DIR/logs/backend.log"
exit 1
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 12. 常见问题排查

### 后端启动失败

```bash
# 查看详细日志
journalctl -u ccblog -n 100 --no-pager
tail -200 /opt/claude-code-blog/logs/backend-error.log

# 常见原因: 数据库连接失败
mysql -u ccblog -p'YourStrongPassword123!' -e "SELECT 1;"

# 常见原因: 端口被占用
ss -tlnp | grep 8080
```

### Nginx 502 Bad Gateway

```bash
# 后端是否在运行
sudo systemctl status ccblog
curl http://localhost:8080/api/articles?page=1&size=1

# Nginx 错误日志
tail -50 /var/log/nginx/error.log
```

### MySQL 连接数过多

```bash
mysql -u root -e "SHOW STATUS LIKE 'Threads_connected';"
mysql -u root -e "SHOW PROCESSLIST;"
# 调整最大连接数
mysql -u root -e "SET GLOBAL max_connections = 200;"
```

### 前端页面白屏

```bash
# 检查 dist 目录是否存在且有内容
ls -la /var/www/ccblog/

# 检查 Nginx 配置中 root 路径是否正确
nginx -T | grep root

# 检查浏览器控制台是否有 API 请求 404/CORS 错误
# 确认 Nginx 的 /api/ 代理配置正确
```

### 磁盘空间不足

```bash
# 查看各目录占用
du -sh /opt/claude-code-blog/*
du -sh /var/log/nginx/*

# 清理旧日志
sudo journalctl --vacuum-time=7d
sudo find /opt/claude-code-blog/logs -name "*.log" -mtime +7 -delete
```

### Docker 容器无法启动

```bash
# 查看容器状态和日志
docker compose ps
docker compose logs mysql
docker compose logs backend

# 容器内调试
docker exec -it cc-blog-backend sh

# 重建镜像
docker compose build --no-cache backend
docker compose up -d
```
