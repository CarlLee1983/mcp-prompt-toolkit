# @carllee1983/prompt-toolkit

<div align="center">

**適用於 MCP 的提示倉庫治理工具集**

[![Version](https://img.shields.io/badge/version-0.3.1-blue.svg)](https://github.com/CarlLee1983/prompts-tooling-sdk)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## 📋 簡介

`@carllee1983/prompt-toolkit` 是一套以 TypeScript 撰寫的工具集，專為驗證與管理 Model Context Protocol (MCP) 所使用的提示倉庫而設計。它提供對 registry 檔案、提示定義與 partials 目錄的完整驗證，確保提示倉庫的完整性與正確性。

## ✨ 特色

- **Registry 驗證**：驗證 `registry.yaml` 的結構並確保所有引用的檔案存在
- **提示檔驗證**：依據結構定義檢查單一提示 YAML 檔
- **Partials 驗證**：驗證 partials 目錄結構與檔案存在性
- **Partials 使用驗證**：偵測模板中缺少的 partials 與循環相依
- **倉庫驗證**：一次性檢查所有元件的完整倉庫驗證流程
- **型別安全**：完整的 TypeScript 型別支援
- **結構驗證**：基於 Zod 的結構驗證，提供穩健的型別檢查
- **程式碼品質**：ESLint 設定與自動格式化
- **Git Hooks**：Pre-commit hook 自動執行 lint 修復
- **完善測試**：82 個單元測試，涵蓋完整功能

## 🚀 安裝

```bash
# 使用 npm
npm install @carllee1983/prompt-toolkit

# 使用 pnpm
pnpm add @carllee1983/prompt-toolkit

# 使用 yarn
yarn add @carllee1983/prompt-toolkit
```

## 📖 使用方式

### CLI 使用方式

此套件包含一個 CLI 工具，可從命令列驗證與管理提示倉庫。

#### 安裝

安裝套件後，CLI 可透過 `prompt-toolkit` 命令使用：

```bash
# 使用 npx（無需安裝）
npx @carllee1983/prompt-toolkit --help

# 或全域安裝
npm install -g @carllee1983/prompt-toolkit
prompt-toolkit --help
```

#### CLI 命令

**驗證命令：**
```bash
# 驗證整個倉庫
prompt-toolkit validate repo [path]

# 驗證 registry.yaml
prompt-toolkit validate registry [path] --repo-root <path>

# 驗證單一提示檔
prompt-toolkit validate file <file-path>

# 驗證 partials 目錄
prompt-toolkit validate partials [path] --partials-path <path>
```

**檢查命令：**
```bash
# 檢查 partials 使用情況（缺少的 partials 與循環相依）
prompt-toolkit check partials [path]
```

**列表命令：**
```bash
# 列出所有 prompts
prompt-toolkit list prompts [path] [--group <name>] [--enabled-only]

# 列出所有 groups
prompt-toolkit list groups [path] [--enabled-only]
```

**統計資訊：**
```bash
# 顯示倉庫統計資訊
prompt-toolkit stats [path]
```

**輸出選項：**
- `--format <json|text>` - 輸出格式（預設：text）
- `--output <file>` - 將輸出寫入檔案
- `--exit-code` - 驗證失敗時以非零退出碼退出

**範例：**
```bash
# 以 JSON 格式驗證倉庫
prompt-toolkit validate repo --format json

# 檢查 partials 並將結果儲存到檔案
prompt-toolkit check partials --format json --output results.json

# 列出所有啟用的 prompts
prompt-toolkit list prompts --enabled-only

# 以 JSON 格式顯示統計資訊
prompt-toolkit stats --format json
```

### 程式化使用方式

### 基本範例

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

// 驗證整個提示倉庫
const result = validatePromptRepo('/path/to/prompt-repo')

if (result.passed) {
  console.log('Repository validation passed!')
} else {
  console.error('Validation errors:', result.errors)
}
```

### 驗證 Registry

```typescript
import { validateRegistry } from '@carllee1983/prompt-toolkit'

const result = validateRegistry('/path/to/registry.yaml', '/path/to/repo-root')

if (result.success) {
  console.log('Registry is valid:', result.data)
} else {
  console.error('Registry validation failed:', result.error)
}
```

### 驗證提示檔

```typescript
import { validatePromptFile } from '@carllee1983/prompt-toolkit'

const result = validatePromptFile('/path/to/prompt.yaml')

if (result.success) {
  console.log('Prompt is valid:', result.data)
} else {
  console.error('Prompt validation failed:', result.error)
}
```

### 驗證 Partials

```typescript
import { validatePartials } from '@carllee1983/prompt-toolkit'

// 回傳 partial 檔案路徑的陣列；若 partialPath 未設定則回傳空陣列
const partials = validatePartials('/path/to/repo-root', 'partials')

console.log('Found partials:', partials)
```

## 📚 API 參考

### `validatePromptRepo(repoRoot: string)`

驗證整個提示倉庫，包含 registry、所有提示檔案與 partials。

**參數：**
- `repoRoot`: 倉庫根目錄路徑

**回傳：**
```typescript
{
  passed: boolean
  errors: Array<{ file: string; errors: ZodError }>
}
```

### `validateRegistry(registryPath: string, repoRoot: string)`

驗證 registry.yaml 的結構，並確保所有引用的群組與提示存在。

**參數：**
- `registryPath`: registry.yaml 檔案路徑
- `repoRoot`: 倉庫根目錄路徑

**回傳：**
```typescript
ZodSafeParseReturnType<RegistryDefinition>
```

**可能拋出：**
- 當群組資料夾或提示檔案缺少時拋出 `Error`

### `validatePromptFile(filePath: string)`

依據提示結構驗證單一提示 YAML 檔案。

**參數：**
- `filePath`: 提示 YAML 檔案路徑

**回傳：**
```typescript
ZodSafeParseReturnType<PromptDefinition>
```

### `validatePartials(repoRoot: string, partialPath?: string)`

驗證並回傳指定目錄中的所有 partial 檔案。

**參數：**
- `repoRoot`: 倉庫根目錄路徑
- `partialPath`: 選填，partials 目錄路徑（相對於 repoRoot）

**回傳：**
```typescript
string[] // 檔案路徑陣列
```

**可能拋出：**
- 若提供 partialPath 且 partials 資料夾不存在時拋出 `Error`

## 📝 結構定義

### Registry 結構

```typescript
interface RegistryDefinition {
  version: number
  globals?: Record<string, string>
  partials?: {
    enabled: boolean
    path: string
  }
  groups: Record<string, RegistryGroup>
}

interface RegistryGroup {
  path: string
  enabled: boolean
  prompts: string[]
}
```

### 提示結構

```typescript
interface PromptDefinition {
  id: string
  title: string
  description: string
  args: Record<string, PromptArg>
  template: string
}

interface PromptArg {
  type: 'string' | 'number' | 'boolean' | 'object'
  description?: string
  required?: boolean
  default?: unknown
}
```

## 🧪 測試

```bash
# 執行測試
pnpm test

# 監看模式執行測試
pnpm test

# 單次執行測試
pnpm test:run

# 產生覆蓋率報告
pnpm test:coverage
```

## 🛠️ 開發

```bash
# 安裝相依套件
pnpm install

# 建置專案
pnpm build

# 監看模式建置
pnpm dev

# 執行 linter
pnpm lint

# 自動修復 lint 問題
pnpm lint:fix
```

## 🔧 程式碼品質

本專案使用 ESLint 確保程式碼品質與一致性：

- **ESLint 設定**：現代扁平配置格式（ESLint 9+）
- **TypeScript 支援**：完整的 TypeScript linting，使用 `@typescript-eslint`
- **程式碼風格**：強制不使用分號、單引號等專案規範
- **Pre-commit Hooks**：使用 Husky 在每次 commit 前自動執行 `lint:fix`

### Pre-commit Hook

專案包含 pre-commit hook，會自動：
- 在 commit 前對所有檔案執行 ESLint 修復
- 將修復後的檔案重新加入 staging area
- 確保 commit 前的程式碼品質

當你執行 `pnpm install` 時會自動設定（透過 `prepare` script）。

## 📦 專案結構

```
prompts-tooling-sdk/
├── src/
│   ├── index.ts              # 主要進入點
│   ├── validators/           # 驗證函式
│   │   ├── validateRepo.ts
│   │   ├── validateRegistry.ts
│   │   ├── validatePromptFile.ts
│   │   ├── validatePartials.ts
│   │   └── validatePartialsUsage.ts
│   ├── partials/             # Partials 工具
│   │   ├── extractPartials.ts
│   │   ├── resolvePartialPath.ts
│   │   ├── buildPartialGraph.ts
│   │   └── detectCircular.ts
│   ├── schema/               # Zod 結構定義
│   │   ├── registry.schema.ts
│   │   └── prompt.schema.ts
│   ├── types/                # TypeScript 型別定義
│   │   ├── registry.ts
│   │   └── prompt.ts
│   └── utils/                # 工具函式
│       ├── loadYaml.ts
│       └── walkDir.ts
├── test/                     # 測試檔案
├── .husky/                   # Git hooks (pre-commit)
├── dist/                     # 建置產物
├── eslint.config.mjs         # ESLint 設定檔
└── package.json
```

## 📄 授權

ISC

## 👤 作者

CarlLee1983

## 🤝 貢獻

歡迎任何形式的貢獻！請隨時提交 Pull Request。

## 📝 更新日誌

### [0.3.1] - CI/CD 增強

- 新增 GitHub Actions CI workflow
- 自動化 lint、test 和 build 檢查
- 改善開發流程可靠性
- 確保合併前程式碼品質

### [0.3.0] - CLI 工具發佈

- 新增完整的 CLI 工具，提供命令列介面
- 實作驗證命令（repo, registry, file, partials）
- 實作檢查命令（partials 使用情況）
- 實作列表命令（prompts, groups）
- 實作統計命令，顯示倉庫統計資訊
- 支援文字和 JSON 兩種輸出格式
- 彩色終端機輸出與載入動畫
- 支援輸出到檔案與退出碼控制
- 新增 CLI 文件與使用範例

### [0.2.0] - 程式碼品質與 Partials 增強

- 新增 ESLint 設定，支援 TypeScript
- 新增 Husky pre-commit hooks，自動執行 lint 修復
- 新增 partials 使用驗證（偵測缺少的 partials 與循環相依）
- 增強倉庫驗證，包含 partials 使用檢查
- 改善型別安全，使用明確的錯誤型別
- 新增 partials 功能的完整單元測試（總計 82 個測試）
- 新增 CLI 工具，包含 validate、check、list 和 stats 命令
- 支援文字和 JSON 兩種輸出格式
- 更新套件名稱為 `@carllee1983/prompt-toolkit`

### [0.1.0] - 初始版本

- prompts-tooling-sdk 初始發佈
- Registry 驗證功能
- 提示檔驗證功能
- Partials 目錄驗證功能
- 完整的倉庫驗證流程
- YAML 載入與資料夾掃描工具
- 完整的單元測試套件（28 個測試案例）
- TypeScript 專案設定與建置配置
