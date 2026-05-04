# 🚀 CHI TIÊU — APP QUẢN LÝ CHI TIÊU HÀNG THÁNG

**Toàn bộ project đã hoàn thiện, sẵn sàng chạy dưới local!**

---

## 📦 File Download

Có 2 cách nhận project:

### **Cách 1: Download folder `expense-tracker`**
- Chuẩn bị dễ nhất, copy-paste xong là dùng
- Folder này có tất cả code, config, rules

### **Cách 2: Download file `expense-tracker.tar.gz`**
```bash
tar -xzf expense-tracker.tar.gz
cd expense-tracker
```

---

## ⚡ Cài đặt nhanh (5 phút)

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Tạo Firebase Project
- Vào https://console.firebase.google.com
- Tạo project mới (tên: `chi-tieu` hoặc gì cũng được)
- Enable **Firestore Database** (Production mode)
- Enable **Storage**

### 3️⃣ Deploy Firestore Rules
```bash
npm install -g firebase-tools
firebase login
firebase use --add
npm run deploy:rules
```

### 4️⃣ Cấu hình Google OAuth
- Vào https://console.cloud.google.com
- **APIs & Services > Credentials**
- Tạo **OAuth 2.0 Client ID** (Web application)
- Redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy **Client ID** và **Client Secret**

### 5️⃣ Tạo `.env.local`
```bash
# Sinh secret
openssl rand -base64 32

# Tạo file .env.local và paste:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_SECRET_HERE

GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-admin-email@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

### 6️⃣ Chạy dev server
```bash
npm run dev
```

Vào http://localhost:3000 ✅

---

## 📚 Chi tiết + Troubleshooting

👉 **Xem file `SETUP_LOCAL.md`** trong folder project

---

## 🎯 Tính năng có sẵn

✅ **Đăng nhập bằng Google**
- NextAuth.js + OAuth
- User data lưu tự động vào Firestore

✅ **Dashboard**
- Biểu đồ thu/chi 6 tháng (Bar Chart)
- Phân bố chi tiêu theo danh mục (Pie Chart)
- Thẻ thống kê (Số dư, Thu, Chi)
- Giao dịch gần đây

✅ **Quản lý giao dịch**
- Thêm/Sửa/Xóa giao dịch
- Lọc theo tháng, danh mục
- Ghi chú, ngày tùy chỉnh
- Mobile + Desktop responsive

✅ **Ngân sách**
- Đặt hạn mức chi theo danh mục
- Progress bar với cảnh báo (80%, 100%)
- So sánh giữa các tháng

✅ **Báo cáo**
- Top 5 danh mục chi tiêu
- Biểu đồ phân tích chi tiết
- Xuất CSV để xem trong Excel

✅ **Danh mục mặc định**
- 🍜 Ăn uống
- 🚗 Di chuyển
- 🛍️ Mua sắm
- 🎮 Giải trí
- 💊 Y tế
- 📄 Hoá đơn
- 💰 Lương
- 📦 Khác

---

## 🛠️ Tech Stack

```
Frontend:        React 19 + Next.js App Router + TypeScript
Styling:         Tailwind CSS
UI Components:   Custom (+ Recharts for charts)
State:           React Query + React Context
Auth:            NextAuth.js (Google OAuth)
Backend:         Next.js API Routes
Database:        Firebase Firestore (NoSQL)
Storage:         Firebase Storage (ảnh hoá đơn)
Deployment:      Vercel (recommended)
```

---

## 📱 Mobile-First Design

- ✅ Bottom navigation trên mobile
- ✅ Top navbar trên desktop
- ✅ Responsive forms
- ✅ Có thể cài như PWA (chuẩn bị)

---

## 🔐 Bảo mật

- ✅ Firestore Security Rules — chỉ user đó mới thấy data của mình
- ✅ NextAuth JWT + Session
- ✅ Admin SDK xác thực server-side
- ✅ Environment variables không để public keys

---

## 📂 Cấu trúc thư mục

```
expense-tracker/
├── app/
│   ├── (auth)/login/              # Trang đăng nhập
│   ├── (dashboard)/               # Protected routes
│   │   ├── page.tsx               # Dashboard
│   │   ├── transactions/page.tsx
│   │   ├── budgets/page.tsx
│   │   └── reports/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── transactions/          # CRUD transactions
│   │   ├── budgets/               # CRUD budgets
│   │   └── categories/            # Categories API
│   ├── layout.tsx                 # Root layout
│   ├── globals.css
│   └── providers.tsx              # NextAuth + React Query
│
├── components/
│   ├── charts/                    # Recharts wrappers
│   │   ├── ExpensePieChart.tsx
│   │   └── MonthlyBarChart.tsx
│   ├── TransactionForm.tsx        # Add/Edit transaction
│   ├── TransactionList.tsx        # List + Delete
│   ├── BudgetProgressBar.tsx
│   ├── StatsCard.tsx
│   ├── NavBar.tsx                 # Navigation
│   └── LoginButton.tsx
│
├── lib/
│   ├── firebase-admin.ts          # Server SDK
│   ├── firebase-client.ts         # Client SDK
│   ├── auth.ts                    # NextAuth config
│   ├── hooks.ts                   # React Query hooks
│   ├── api-helpers.ts             # getAuthUser()
│   └── utils.ts                   # formatVND, formatDate
│
├── types/
│   └── index.ts                   # TypeScript types
│
├── public/
│   └── manifest.json              # PWA manifest
│
├── firestore.rules                # Security rules
├── storage.rules
├── firebase.json
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── .env.local.example             # Template
└── README.md
```

---

## 🚀 Lên production (sau)

```bash
# Deploy lên Vercel
vercel
```

Firestore Rules + Storage Rules đã sẵn sàng, chỉ cần:
```bash
npm run deploy:rules
```

---

## ❓ Hỏi gì không chắc?

**Mở file `SETUP_LOCAL.md`** — nó có:
- Hướng dẫn chi tiết từng bước
- Lấy từng key từ Firebase console
- Troubleshooting lỗi thường gặp
- Cách deploy lên Vercel

---

## 🎉 Let's go!

```bash
cd expense-tracker
npm install
# Tạo .env.local (xem SETUP_LOCAL.md)
npm run dev
# Vào http://localhost:3000
```

**Chúc bạn code vui vẻ!** 💸✨

---

**Liên hệ / Issues?** → Check SETUP_LOCAL.md → Troubleshooting section
