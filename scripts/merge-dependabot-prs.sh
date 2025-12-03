#!/bin/bash

# 自動化處理 Dependabot PR 的腳本
# 逐一合併、測試、驗證每個 PR

set -e  # 遇到錯誤立即退出

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PR 分支列表（按風險從低到高排序）
PR_BRANCHES=(
  "dependabot/npm_and_yarn/types/node-24.10.1"
  "dependabot/npm_and_yarn/glob-13.0.0"
  "dependabot/npm_and_yarn/chalk-5.6.2"
  "dependabot/npm_and_yarn/ora-9.0.0"
  "dependabot/npm_and_yarn/zod-4.1.13"
  "dependabot/npm_and_yarn/vitest-4.0.15"
)

# 記錄失敗的分支
FAILED_BRANCHES=()

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Dependabot PR 自動化處理腳本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 確保在 main 分支
echo -e "${YELLOW}📌 確保在 main 分支...${NC}"
git checkout main
git pull origin main

# 確保工作目錄乾淨
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}❌ 工作目錄不乾淨，請先提交或暫存變更${NC}"
  exit 1
fi

# 處理每個 PR 分支
for branch in "${PR_BRANCHES[@]}"; do
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}處理分支: ${branch}${NC}"
  echo -e "${BLUE}========================================${NC}"
  
  # 檢查分支是否存在
  if ! git ls-remote --heads origin "$branch" | grep -q "$branch"; then
    echo -e "${YELLOW}⚠️  分支 $branch 不存在於遠端，跳過${NC}"
    continue
  fi
  
  # 建立測試分支
  TEST_BRANCH="test-merge-${branch//\//-}"
  echo -e "${YELLOW}📦 建立測試分支: $TEST_BRANCH${NC}"
  git checkout -b "$TEST_BRANCH" 2>/dev/null || git checkout "$TEST_BRANCH"
  git reset --hard main
  
  # 合併 PR 分支
  echo -e "${YELLOW}🔄 合併 $branch 到測試分支...${NC}"
  if ! git merge "origin/$branch" --no-edit; then
    echo -e "${RED}❌ 合併失敗: $branch${NC}"
    FAILED_BRANCHES+=("$branch (merge conflict)")
    git merge --abort 2>/dev/null || true
    git checkout main
    git branch -D "$TEST_BRANCH" 2>/dev/null || true
    continue
  fi
  
  # 安裝依賴
  echo -e "${YELLOW}📥 安裝依賴...${NC}"
  if ! pnpm install; then
    echo -e "${RED}❌ 依賴安裝失敗: $branch${NC}"
    FAILED_BRANCHES+=("$branch (install failed)")
    git checkout main
    git branch -D "$TEST_BRANCH" 2>/dev/null || true
    continue
  fi
  
  # 建置
  echo -e "${YELLOW}🔨 建置專案...${NC}"
  if ! pnpm build; then
    echo -e "${RED}❌ 建置失敗: $branch${NC}"
    FAILED_BRANCHES+=("$branch (build failed)")
    git checkout main
    git branch -D "$TEST_BRANCH" 2>/dev/null || true
    continue
  fi
  
  # 執行測試
  echo -e "${YELLOW}🧪 執行測試...${NC}"
  if ! pnpm test:run; then
    echo -e "${RED}❌ 測試失敗: $branch${NC}"
    FAILED_BRANCHES+=("$branch (tests failed)")
    git checkout main
    git branch -D "$TEST_BRANCH" 2>/dev/null || true
    continue
  fi
  
  # Lint 檢查
  echo -e "${YELLOW}🔍 執行 Lint 檢查...${NC}"
  if ! pnpm lint; then
    echo -e "${RED}❌ Lint 失敗: $branch${NC}"
    FAILED_BRANCHES+=("$branch (lint failed)")
    git checkout main
    git branch -D "$TEST_BRANCH" 2>/dev/null || true
    continue
  fi
  
  # 所有檢查通過，合併到 main
  echo -e "${GREEN}✅ 所有檢查通過！合併到 main...${NC}"
  git checkout main
  if ! git merge "$TEST_BRANCH" --no-edit; then
    echo -e "${RED}❌ 合併到 main 失敗: $branch${NC}"
    FAILED_BRANCHES+=("$branch (merge to main failed)")
    git merge --abort 2>/dev/null || true
  else
    echo -e "${GREEN}✅ 成功合併 $branch 到 main${NC}"
  fi
  
  # 清理測試分支
  git branch -D "$TEST_BRANCH" 2>/dev/null || true
  
  echo -e "${GREEN}✅ $branch 處理完成${NC}"
done

# 總結
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  處理完成總結${NC}"
echo -e "${BLUE}========================================${NC}"

if [ ${#FAILED_BRANCHES[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ 所有 PR 都成功合併！${NC}"
  echo ""
  echo -e "${YELLOW}下一步：${NC}"
  echo "1. 檢查變更: git log --oneline -10"
  echo "2. 執行最終測試: pnpm test:run && pnpm lint"
  echo "3. 更新版本號: npm version patch"
  echo "4. 推送到遠端: git push origin main --tags"
else
  echo -e "${RED}❌ 以下分支處理失敗：${NC}"
  for failed in "${FAILED_BRANCHES[@]}"; do
    echo -e "${RED}  - $failed${NC}"
  done
  echo ""
  echo -e "${YELLOW}請手動檢查失敗的分支${NC}"
  exit 1
fi

