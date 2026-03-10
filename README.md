# 찾공做 ZhaoGongZuo — Construction Job Marketplace MVP

A React Native + Expo (TypeScript) app for connecting construction workers with job sites in Korea.
Supports Korean (한국어), Chinese (中文), and English.

---

## 🚀 iOS 模拟器快速启动（Mac 用户）

> **前提**：Mac 电脑 + 已安装 Xcode（从 App Store 安装，包含 iOS 模拟器）+ 已安装 Node.js

---

### 第 0 步：找到项目路径，打开终端

**如果你是从 GitHub 克隆下来的：**

项目通常在你运行 `git clone` 时所在的目录。最常见的位置是：

```
~/Documents/zhaogongzuo
~/Desktop/zhaogongzuo
~/zhaogongzuo
```

**不确定路径？用 Finder 找一下：**

1. 打开 **Finder**（Dock 底部的笑脸图标）
2. 菜单栏点击 **前往 → 个人** （或按 `⌘ + Shift + H`）
3. 在文件夹列表里找名字叫 `zhaogongzuo` 的文件夹
4. 找到之后，**右键点击那个文件夹** → 选择 **"在终端中打开"**（macOS Sonoma 及以上）

> 💡 **如果右键菜单里没有"在终端中打开"**：
> 1. 打开 **终端**（按 `⌘ + 空格`，搜索"终端"，回车）
> 2. 把 Finder 里的 `zhaogongzuo` 文件夹**直接拖拽**到终端窗口里
> 3. 松手后路径会自动填入，然后在路径前面手动加 `cd ` 并回车

**如果你是下载的 ZIP 文件：**

ZIP 一般解压到 `~/Downloads/zhaogongzuo-main` 或 `~/Downloads/zhaogongzuo`。
打开终端后输入：

```bash
cd ~/Downloads/zhaogongzuo-main
# 如果报错，试试：
cd ~/Downloads/zhaogongzuo
```

**确认路径正确的方法** — 在终端输入以下命令，应该能看到 `package.json`：

```bash
ls
# 输出里应该有：app/  package.json  README.md  src/  ...
```

---

### 第 1–3 步：启动 App

进入项目目录后，在终端依次运行：

```bash
# 第 1 步：安装依赖（只需运行一次，之后不用再运行）
npm install

# 第 2 步：启动开发服务器
npx expo start

# 第 3 步：等终端出现菜单后，按键盘上的 i 键
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
| `npm: command not found` | 先安装 Node.js：去 https://nodejs.org 下载 LTS 版本 |
| `npx expo start` 之后没有出现 `i` 选项 | 确认已安装 Xcode，并在 Xcode → Settings → Platforms 里下载至少一个 iOS 模拟器 |
| 模拟器打开但 App 白屏转圈不动 | 在终端按 `r` 键重新加载；或关掉模拟器重新按 `i` |
| `cannot find module` 报错 | 重新运行 `npm install`，然后再 `npx expo start` |

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
