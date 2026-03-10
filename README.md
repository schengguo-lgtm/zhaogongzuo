# 찾공做 ZhaoGongZuo — Construction Job Marketplace MVP

A React Native + Expo (TypeScript) app for connecting construction workers with job sites in Korea.
Supports Korean (한국어), Chinese (中文), and English.

---

## ✅ App 现在可以测试了！

> **是的，App 已完工，可以立即在 iOS 模拟器上完整体验所有界面。**
>
> 无需任何账号、无需配置 Firebase 或 API Key——直接运行即可。

### 📱 可以测试的所有功能

| 界面 | 功能 | 测试方法 |
|---|---|---|
| 语言选择 | 选中文 / 韩文 / 英文 | 第一次打开时出现 |
| 手机登录 | 输入任意手机号 | 如 `010-1234-5678` |
| OTP 验证 | 输入任意 6 位数字 | 如 `123456`，直接通过 |
| 角色选择 | 选工人 / 雇主 / 两者都是 | 登录后出现 |
| 🗺 地图主界面 | 首尔附近 10 个工地标注 | 主 Tab |
| 工地详情 | 查看职位、工资、要求 | 点击地图上的标注 |
| 申请工作 | 点击申请按钮 | 在工地详情页 |
| 📋 申请记录 | 查看已申请的工作 | 底部第 2 个 Tab |
| 💬 聊天室 | 查看聊天列表和对话 | 底部第 3 个 Tab |
| 👤 个人资料 | 查看个人信息 | 底部第 4 个 Tab |
| 雇主看板 | 查看/接受/拒绝申请人 | 个人资料页面进入 |
| 证件上传 | 上传证件界面（演示） | 工地详情页 |

### 🎯 首次测试推荐流程（约 3 分钟走完所有界面）

```
① 启动后 → 选"中文" → 下一步
② 登录页 → 输入 010-1234-5678 → 获取验证码
③ OTP 页 → 输入 123456 → 验证
④ 角色页 → 选"工人"或"两者都是"
⑤ 地图页 → 点击地图上任意蓝色标注 → 查看工地详情
⑥ 工地详情 → 点击"申请" → 查看申请成功提示
⑦ 切换底部 Tab → 查看"申请记录"、"聊天"、"个人资料"
```

---

## 🚀 iOS 模拟器快速启动（Mac 用户）

> **前提**：Mac 电脑 + 已安装 Xcode（从 App Store 安装，包含 iOS 模拟器）+ 已安装 Node.js

---

### 📥 第 0 步：把项目下载到 `zhaogongzuo` 文件夹（只需做一次）

> **如果你已经下载过了，跳过这一步，直接看下方"第 1 步：进入项目目录"。**

#### 方法一：用 Git 下载（推荐）

**第 1 步**：打开**终端**（按 `⌘ + 空格`，搜索"终端"，回车）

**第 2 步**：进入你想放项目的文件夹，例如放在"文件"里：

```bash
cd ~/文件
```

> 也可以选其他位置：`cd ~/Desktop`（桌面）或 `cd ~/Documents`（Documents 文件夹）

**第 3 步**：运行以下命令，自动创建 `zhaogongzuo` 文件夹并下载所有代码：

```bash
git clone https://github.com/schengguo-lgtm/zhaogongzuo.git
```

**第 4 步**：下载完成后，进入项目文件夹：

```bash
cd zhaogongzuo
```

✅ **下载完成！直接跳到下方"第 2–4 步：启动 App"。**

> 💡 **没有安装 Git？** 在终端输入 `git --version`。如果弹出安装提示，点击"安装"即可（macOS 自带安装引导，约 5 分钟）。

---

#### 方法二：下载 ZIP（不用安装 Git）

1. 打开浏览器，访问 **https://github.com/schengguo-lgtm/zhaogongzuo**
2. 点击绿色 **"Code"** 按钮 → 选 **"Download ZIP"**
3. ZIP 下载到"下载"文件夹后，**双击解压**
4. 解压后文件夹名是 `zhaogongzuo-main`，**右键 → 重新命名** → 改成 `zhaogongzuo`
5. 把 `zhaogongzuo` 文件夹**移动**到你想放的位置（如 `~/文件/` 或桌面）

✅ **下载完成！继续按下方步骤启动 App。**

---

### 第 1 步：进入项目目录，打开终端

> **刚刚用 `git clone` 下载的**：终端里已经在 `zhaogongzuo` 文件夹里了，直接跳到"第 2–4 步：启动 App"。

**重新打开终端时，需要先进入项目目录：**

**已知项目路径？直接在终端输入 `cd` 命令：**

打开**终端**（按 `⌘ + 空格`，搜索"终端"，回车），然后输入：

```bash
cd <你的项目路径>/zhaogongzuo
```

例如，如果项目在 `文件` 文件夹里，用户名是 `chengguo`：

```bash
cd ~/文件/zhaogongzuo
```

---

> ⚠️ **中文 macOS 特别说明：Finder 显示的路径 ≠ 终端里的路径**
>
> 在中文系统的 Finder 里，路径看起来是：
> ```
> /用户/chengguo/文件/zhaogongzuo
> ```
> 但在**终端**里，你需要把 `/用户/你的用户名` 替换成 `~`，写成：
> ```bash
> cd ~/文件/zhaogongzuo
> ```
> 规律：**`/用户/XXX` → 终端里写 `~`**（`~` 代表你自己的主文件夹）

---

**不知道路径？用 Finder 找一下（最简单的方法）：**

1. 打开 **Finder**（Dock 底部的笑脸图标）
2. 菜单栏点击 **前往 → 个人** （或按 `⌘ + Shift + H`）
3. 在文件夹列表里找名字叫 `zhaogongzuo` 的文件夹
4. 找到之后，**右键点击那个文件夹** → 选择 **"在终端中打开"**（macOS Sonoma 及以上）

> 💡 **如果右键菜单里没有"在终端中打开"**：
> 1. 打开 **终端**（按 `⌘ + 空格`，搜索"终端"，回车）
> 2. 把 Finder 里的 `zhaogongzuo` 文件夹**直接拖拽**到终端窗口里
> 3. 路径自动填入后，在最前面手动加 `cd ` 然后回车

**常见克隆路径（从 GitHub clone 下来的）：**

```bash
cd ~/文件/zhaogongzuo          # 放在"文件"文件夹
cd ~/Documents/zhaogongzuo     # 放在 Documents
cd ~/Desktop/zhaogongzuo       # 放在桌面
cd ~/Downloads/zhaogongzuo     # 放在下载
cd ~/Downloads/zhaogongzuo-main  # ZIP 解压后
```

**确认路径正确的方法** — 在终端输入以下命令，应该能看到 `package.json`：

```bash
ls
# 输出里应该有：app/  package.json  README.md  src/  ...
```

---

### 第 2–4 步：启动 App

> ⚠️ **最常见错误：忘记先进入项目文件夹！**
>
> 运行下面任何命令之前，终端里必须显示你在 `zhaogongzuo` 目录里。
> 检查方法：看终端提示符，例如：
> ```
> chengguo@MacBookPro zhaogongzuo %    ← ✅ 正确，在项目文件夹里
> chengguo@MacBookPro Desktop %        ← ❌ 错误，需要先 cd
> chengguo@MacBookPro ~ %              ← ❌ 错误，需要先 cd
> ```
> 如果不在 `zhaogongzuo` 里，先运行：
> ```bash
> cd ~/Desktop/zhaogongzuo   # 如果项目在桌面
> # 或
> cd ~/Documents/zhaogongzuo # 如果项目在文稿/Documents
> # 或
> cd ~/文件/zhaogongzuo       # 如果项目在"文件"里
> ```

进入项目目录后，在终端依次运行：

```bash
# 第 2 步：安装依赖（只需运行一次，之后不用再运行）
npm install

# 第 3 步：启动开发服务器
npx expo start

# 第 4 步：等终端出现菜单后，按键盘上的 i 键
# → 会自动打开 iOS 模拟器并加载 App
```

**登录方式（演示模式，无需真实账号）**：
- 手机号：输入任意号码（如 `010-1234-5678`）
- OTP 验证码：输入**任意 6 位数字**即可通过（如 `123456`）

> 🔥 **无需配置 Firebase、Google Maps 或任何 API Key** — 所有数据均为模拟数据，可以完整体验 App 的所有界面。

---

### 常见问题

| 问题 | 解决方法 |
|---|---|
| `ConfigError: The expected package.json path: .../Desktop/package.json does not exist` | 你在错误的目录里运行了命令。先运行 `cd zhaogongzuo` 进入项目文件夹，再重新运行命令 |
| `npm: command not found` | 先安装 Node.js：去 https://nodejs.org 下载 LTS 版本 |
| `npx expo start` 之后没有出现 `i` 选项 | 确认已安装 Xcode，并在 Xcode → Settings → Platforms 里下载至少一个 iOS 模拟器 |
| 模拟器打开但 App 白屏转圈不动 | 在终端按 `r` 键重新加载；或关掉模拟器重新按 `i` |
| `cannot find module` 报错 | 重新运行 `npm install`，然后再 `npx expo start` |
| 提示"No usable data found"或地图空白 | 正常现象，演示模式地图可能需要几秒加载 |
| 模拟器一直停在启动画面（Splash Screen） | 终端按 `Ctrl+C` 停止，重新运行 `npx expo start`，再按 `i` |
| OTP 输完没有跳转 | 确认输入了**6 位**数字（如 `123456`），然后点确认 |

---

## Tech Stack

| Category | Choice | Notes |
|---|---|---|
| Framework | React Native + Expo SDK 51 | Cross-platform iOS/Android |
| Language | TypeScript | Strict mode enabled |
| Navigation | Expo Router v3 | File-based routing |
| Auth | Firebase Auth (Phone OTP) | `@react-native-firebase/auth` for production |
| Database | Firebase Firestore | Real-time chat & applications |
| File Storage | Firebase Storage | MVP; migrate to S3 presigned URLs in production |
| Maps | react-native-maps | Google Maps (iOS: Apple Maps); swap to Naver Maps in production |
| i18n | react-i18next + i18next | ko / zh / en |
| State | Zustand | Auth + App stores |
| Rate Limiting | AsyncStorage + client guard | **Must add server-side Cloud Functions** |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd zhaogongzuo
npm install
```

### 2. Configure environment (optional — only needed for production features)

```bash
cp .env.example .env
# Edit .env with your Firebase and Maps API keys
```

### 3. Start the development server

```bash
npx expo start
```

Press `i` to open in iOS Simulator, `a` for Android emulator, or scan the QR code with Expo Go on your device.

---

## Demo Mode vs. Production Mode

| Feature | Demo Mode (no config needed) | Production Mode |
|---|---|---|
| Login | Any phone + any 6 digits | Real SMS OTP via Firebase |
| Map | Apple Maps (no key needed) | Google Maps / Naver Maps |
| Job Sites | 10 mock sites across Seoul | Real Firestore data |
| Chat | Mock messages | Real-time Firestore |
| Apply | Local state only | Firestore + notifications |
| Documents | Mock upload UI | Firebase Storage |
| Session | Persisted in AsyncStorage | Same |

---

## Environment Variables

See `.env.example` for all required variables. None are required for demo mode.

### Firebase Setup (production only)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Phone Authentication** in Firebase Auth
3. Create a **Firestore** database (start in test mode for MVP)
4. Create a **Storage** bucket
5. Copy your project config into `.env`

### Maps Setup

**Google Maps (default — works in Expo Go)**
- Create an API key at https://console.cloud.google.com
- Enable Maps SDK for Android + iOS
- Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`
- Set `YOUR_GOOGLE_MAPS_API_KEY` in `app.json` → `android.config.googleMaps.apiKey`

**Naver Maps (recommended for Korea — requires native build)**

> Naver Maps provides better Korean map data, road names, and POIs.

1. Register at https://console.ncloud.com and create an "Application" with Maps for Mobile
2. Install: `npx expo install @mj-studio/react-native-naver-map`
3. Set `EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID` in `.env`
4. Replace the `MapView` import in `app/(tabs)/index.tsx`:

```tsx
// Replace:
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
// With:
import NaverMapView, { NaverMapMarkerOverlay, NaverMapCallout } from '@mj-studio/react-native-naver-map';
```

5. Add to `app.json` plugins:
```json
["@mj-studio/react-native-naver-map", { "android": { "clientId": "YOUR_NAVER_MAPS_CLIENT_ID" }, "ios": { "clientId": "YOUR_NAVER_MAPS_CLIENT_ID" } }]
```

6. Build with EAS: `eas build --profile development --platform android`

---

## Project Structure

```
zhaogongzuo/
├── app/                        # Expo Router screens (file-based routing)
│   ├── _layout.tsx             # Root layout (auth guard, i18n init)
│   ├── (auth)/                 # Auth flow
│   │   ├── language.tsx        # Language selection (first launch)
│   │   ├── login.tsx           # Phone number input
│   │   ├── otp.tsx             # OTP verification
│   │   └── role.tsx            # Role selection (worker/employer/both)
│   ├── (tabs)/                 # Main tab navigation
│   │   ├── index.tsx           # 🗺 Map tab (main)
│   │   ├── jobs.tsx            # 📋 Applications tab
│   │   ├── chat.tsx            # 💬 Chat list tab
│   │   └── profile.tsx         # 👤 Profile tab
│   ├── site/[id].tsx           # Site detail + job cards
│   ├── chat/[id].tsx           # Chat room
│   ├── document-auth.tsx       # Document upload + 24h authorization
│   ├── disclaimer.tsx          # Legal disclaimer
│   └── employer/dashboard.tsx  # Employer dashboard
├── src/
│   ├── types/                  # TypeScript domain types
│   ├── constants/              # Colors, config
│   ├── mock/                   # 10 mock construction sites
│   ├── i18n/                   # ko / zh / en translations
│   ├── services/               # Firebase (auth, firestore, storage)
│   ├── hooks/                  # useAuth, useRateLimit
│   ├── store/                  # Zustand stores (authStore, appStore)
│   └── components/             # Shared UI components
├── assets/                     # App icons + splash
├── .env.example                # Environment variable template
└── README.md
```

---

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Language selection (ko/zh/en) | ✅ Complete | Persisted in AsyncStorage |
| Phone login (OTP) | ✅ Demo ready | Any 6 digits work; wire Firebase for production |
| Role selection | ✅ Complete | worker / employer / both; persisted |
| Session persistence | ✅ Complete | Stays logged in after restart |
| Map with mock sites | ✅ Complete | 10 sites across Seoul/Korea |
| List view toggle | ✅ Complete | Toggle between map and list |
| GPS location + distance | ✅ Complete | Calculates distance from user location |
| Site detail | ✅ Complete | Shows all jobs, wages, requirements |
| Apply for job | ✅ Complete | Local state; wire up Firestore for production |
| Daily application limit | ✅ Complete | Client-side (10/day); add server-side too |
| Chat rooms | ✅ Complete | Mock data; wire up Firestore subscriptions |
| Document upload | 🟡 Mock | UI ready; wire up Firebase Storage |
| Document 24h authorization | 🟡 Mock | UI + flow ready; wire up Firestore |
| Employer dashboard | ✅ Complete | Accept/reject applicants |
| Company verification | 🟡 UI only | Manual review flow (admin backend needed) |
| Legal disclaimer | ✅ Complete | |
| Rate limiting | 🟡 Client-only | Add Cloud Functions for server-side |

---

## Production Roadmap (TODO)

### Security (HIGH PRIORITY)
- [ ] Replace mock OTP with real Firebase Phone Auth + App Check
- [ ] Add strict Firestore security rules (`rules_version = '2'`)
- [ ] Migrate document storage to S3 with presigned URLs (time-limited)
- [ ] Server-side rate limiting via Cloud Functions
- [ ] Encrypt PII in Firestore (at-rest encryption)
- [ ] Audit log every document view (server-side)
- [ ] Verify worker documents via backend (not just status field in Firestore)

### Features
- [ ] Push notifications (Expo Notifications + FCM)
- [ ] Company registration flow with document upload
- [ ] Admin panel for company verification
- [ ] Worker rating system (post-MVP)
- [ ] In-app reporting / flagging
- [ ] Deep links for job sharing
- [ ] Offline support for map data

### Infrastructure
- [ ] EAS Build configuration (`eas.json`)
- [ ] CI/CD with GitHub Actions
- [ ] Staging + production Firebase projects
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Firebase Analytics)

---

## Legal Notes

This app facilitates job matching for construction workers in Korea.

**Operators must ensure:**
- All posted jobs comply with Korean labor law
- Foreign worker placement follows relevant visa/work permit regulations
- Personal data handling complies with PIPA (개인정보 보호법)
- Company verification process prevents fraudulent postings

See `app/disclaimer.tsx` for the in-app legal disclaimer.

---

## License

Private — All rights reserved.
