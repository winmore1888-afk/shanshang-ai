#!/bin/bash
# =============================================
# 善商AI - GitHub Pages 一键部署脚本
# =============================================
# 使用方法:
#   1. 在 GitHub 创建新仓库 (例如: shanshang-ai)
#   2. 运行: bash deploy.sh <你的GitHub用户名> <仓库名>
#   3. 按提示操作即可
# =============================================

set -e

REPO_OWNER="${1:-}"
REPO_NAME="${2:-shanshang-ai}"

if [ -z "$REPO_OWNER" ]; then
  echo "用法: bash deploy.sh <GitHub用户名> [仓库名]"
  echo "示例: bash deploy.sh myusername shanshang-ai"
  exit 1
fi

echo "🚀 善商AI GitHub Pages 部署脚本"
echo "================================"
echo "目标仓库: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo ""

# 检查 gh CLI
if ! command -v gh &> /dev/null; then
  echo "❌ 需要安装 GitHub CLI (gh)"
  echo "   安装方法: https://cli.github.com/"
  exit 1
fi

# 检查登录状态
if ! gh auth status &> /dev/null; then
  echo "🔐 需要登录 GitHub..."
  gh auth login
fi

# 创建仓库（如果不存在）
echo "📦 创建仓库..."
gh repo create "${REPO_OWNER}/${REPO_NAME}" --public --push --source . 2>/dev/null || {
  echo "⚠️  仓库可能已存在，尝试直接推送..."
  git remote add origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git" 2>/dev/null || git remote set-url origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  git push -u origin master
}

# 创建 gh-pages 分支（仅包含 dist/build/h5 构建产物）
echo "📦 准备 GitHub Pages 部署..."
git checkout --orphan gh-pages 2>/dev/null || git checkout gh-pages
git rm -rf . 2>/dev/null || true

# 复制构建产物到根目录
git checkout master -- dist/build/h5/
cp -r dist/build/h5/* .
rm -rf dist

# 提交并推送
git add .
git commit -m "🚀 Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M')" || echo "没有新变更"
git push -u origin gh-pages --force

# 切回 master
git checkout master

echo ""
echo "✅ 部署完成！"
echo ""
echo "🔗 访问地址: https://${REPO_OWNER}.github.io/${REPO_NAME}/"
echo ""
echo "📋 后续步骤:"
echo "  1. 打开 https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/pages"
echo "  2. 确认 Source 选择 'Deploy from a branch'"
echo "  3. Branch 选择 'gh-pages' 和 '/ (root)'"
echo "  4. 点击 Save，等待 1-2 分钟即可访问"
