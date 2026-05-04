# 💸 Chi Tiêu — Web App Quản Lý Chi Tiêu

React + Next.js App Router + Firebase + NextAuth.js

---

## Cài đặt nhanh

```bash
# 1. Cài dependencies
npm install

# 2. Copy file env và điền thông tin
cp .env.local.example .env.local

# 3. Chạy dev server
npm run dev
```

---

## Cấu hình Firebase

### Bước 1 — Tạo Firebase project
1. Vào [console.firebase.google.com](https://console.firebase.google.com)
2. Tạo project mới
3. Bật **Firestore Database** (chế độ Production)
4. Bật **Storage**
5. Vào **Project Settings > Your apps** → thêm Web app → copy config vào `.env.local`

### Bước 2 — Service Account (Admin SDK)
1. **Project Settings > Service Accounts** → Generate new private key
2. Download file JSON, lấy các giá trị sau điền vào `.env.local`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

### Bước 3 — Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase use --add   # chọn project của bạn
npm run deploy:rules
```

---

## Cấu hình Google OAuth (NextAuth)

1. Vào [console.cloud.google.com](https://console.cloud.google.com)
2. Chọn project Firebase của bạn (cùng project)
3. **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Thêm Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.com/api/auth/callback/google` (prod)
6. Copy Client ID và Client Secret vào `.env.local`

### Tạo NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

---

## Deploy lên Vercel

```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy
vercel

# Thêm environment variables trong Vercel Dashboard
# Project Settings > Environment Variables
# Copy tất cả từ .env.local
```

Sau khi deploy, cập nhật `NEXTAUTH_URL` thành URL Vercel thật.

---

## Cấu trúc thư mục

```
expense-tracker/
├── app/
│   ├── (auth)/login/          ← Trang đăng nhập
│   ├── (dashboard)/           ← Layout có auth guard
│   │   ├── page.tsx           ← Dashboard
│   │   ├── transactions/      ← Lịch sử giao dịch
│   │   ├── budgets/           ← Ngân sách
│   │   └── reports/           ← Báo cáo
│   └── api/
│       ├── auth/[...nextauth] ← NextAuth handler
│       ├── transactions/      ← CRUD giao dịch
│       ├── budgets/           ← CRUD ngân sách
│       └── categories/        ← Danh mục
├── components/
│   ├── charts/                ← Recharts wrappers
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   ├── BudgetProgressBar.tsx
│   ├── StatsCard.tsx
│   └── NavBar.tsx
├── lib/
│   ├── firebase-admin.ts      ← Server SDK
│   ├── firebase-client.ts     ← Browser SDK
│   ├── auth.ts                ← NextAuth config
│   ├── hooks.ts               ← React Query hooks
│   ├── api-helpers.ts         ← Auth guard helper
│   └── utils.ts               ← Format tiền, ngày
├── types/index.ts             ← TypeScript types
├── firestore.rules            ← Security rules
├── storage.rules
└── firestore.indexes.json
```

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/transactions?month=2025-05` | Lấy danh sách giao dịch |
| POST | `/api/transactions` | Thêm giao dịch mới |
| PUT | `/api/transactions/:id` | Sửa giao dịch |
| DELETE | `/api/transactions/:id` | Xóa giao dịch |
| GET | `/api/budgets?month=2025-05` | Lấy ngân sách + % đã dùng |
| POST | `/api/budgets` | Tạo/cập nhật ngân sách |
| GET | `/api/categories` | Lấy danh sách danh mục |
| POST | `/api/categories` | Tạo danh mục mới |
