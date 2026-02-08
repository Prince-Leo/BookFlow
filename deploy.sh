#!/bin/bash

# BookFlow 部署脚本
# 用于部署到云服务器 152.32.225.49

set -e

echo "=========================================="
echo "BookFlow 部署脚本"
echo "目标服务器: 152.32.225.49"
echo "=========================================="

# 检查 Docker 和 Docker Compose
if ! command -v docker &> /dev/null; then
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "正在安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 创建项目目录
PROJECT_DIR="/opt/bookflow"
sudo mkdir -p $PROJECT_DIR

# 复制项目文件到服务器
echo "正在复制项目文件..."
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='dist' . root@152.32.225.49:$PROJECT_DIR/

# 在服务器上执行部署
ssh root@152.32.225.49 << 'EOF'
cd /opt/bookflow

# 停止现有服务
echo "停止现有服务..."
docker-compose -f docker/docker-compose.yml down || true

# 拉取最新镜像
echo "拉取最新镜像..."
docker-compose -f docker/docker-compose.yml pull

# 构建并启动服务
echo "构建并启动服务..."
docker-compose -f docker/docker-compose.yml up -d --build

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
docker-compose -f docker/docker-compose.yml ps

echo "=========================================="
echo "部署完成！"
echo "访问地址: http://152.32.225.49"
echo "后端API: http://152.32.225.49:3000"
echo "=========================================="
EOF

echo "本地部署操作完成！"
