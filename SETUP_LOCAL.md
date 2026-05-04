# 🚀 HƯỚNG DẪN CÀI ĐẶT DƯỚI LOCAL

## Bước 1: Tải toàn bộ project

Project đã được tạo hoàn chỉnh. Copy thư mục `expense-tracker` về máy của bạn.

## Bước 2: Cài đặt dependencies

```bash
cd expense-tracker
npm install
```

## Bước 3: Tạo Firebase Project

1. Vào [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → đặt tên (vd: `chi-tieu-app`)
3. Bật Google Analytics (tuỳ chọn)
4. Chờ project được tạo

## Bước 4: Cấu hình Firestore Database

1. Vào project → **Build** (thanh bên trái) → **Firestore Database**
2. Click **"Create Database"**
3. Chọn region gần nhất (vd: `asia-southeast1` cho Việt Nam)
4. Chọn chế độ **"Production mode"** (rồi sẽ cấu hình rules)
5. Click **"Create"**

## Bước 5: Deploy Firestore Rules

1. **Cài Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Liên kết project:**
   ```bash
   firebase use --add
   # Chọn project vừa tạo
   # Đặt alias: dev (hoặc gì cũng được)
   ```

3. **Deploy rules:**
   ```bash
   npm run deploy:rules
   ```

4. Kiểm tra xem các rules đã được deploy hay chưa tại **Firestore > Rules** tab

## Bước 6: Cấu hình Storage

1. Vào **Build > Storage**
2. Click **"Get Started"**
3. Chế độ **Production**
4. Chọn region (giống Firestore)
5. Click **"Done"**

Storage rules đã được deploy cùng lúc.

## Bước 7: Tạo Web App & Lấy Config

1. Vào **Project Settings** (bánh răng 🔧 góc trên bên phải)
2. Tab **"Your apps"** → Click **"</>"** để thêm web app
3. Đặt tên app (vd: `chi-tieu-web`)
4. ✓ **Cài Firebase Hosting** (bỏ qua đó, ta dùng Vercel sau)
5. Click **"Register app"**
6. **Copy cấu hình Firebase** → Lưu lại

Config sẽ trông như này:
```javascript
{
  "apiKey": "AIzaSy...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef..."
}
```

## Bước 8: Tạo Service Account (cho Admin SDK)

1. **Project Settings > Service Accounts** tab
2. Language: **Node.js** (đã chọn sẵn)
3. Click **"Generate new private key"**
4. File JSON sẽ tải về → **Mở nó**
5. Lấy các giá trị:
   ```
   "project_id": "your-project"
   "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
   "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Bước 9: Cấu hình Google OAuth

1. Vào [console.cloud.google.com](https://console.cloud.google.com)
2. Chọn project Firebase (nó sẽ tự xuất hiện)
3. **APIs & Services > Credentials** (thanh bên trái)
4. Click **"+ Create Credentials"** → **"OAuth client ID"**
5. Hỏi **"Configure OAuth consent screen"** → click it
6. **User Type: External** → **"Create"**
7. Form điền:
   - App name: `Chi Tiêu`
   - Email: email của bạn
   - Support email: email của bạn
   - Checkbox sau: ✓ (tất cả)
8. Click **"Save and Continue"** qua các step
9. **"Back to Credentials"** → **"+ Create Credentials"** → **"OAuth client ID"**
10. **Application type: Web application**
11. Thêm **Authorized redirect URIs:**
    ```
    http://localhost:3000/api/auth/callback/google
    ```
12. Click **"Create"**
13. **Copy Client ID và Client Secret**

## Bước 10: Tạo .env.local

Tại thư mục project root, tạo file `.env.local`:

```bash
# =============================
# NEXTAUTH
# =============================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

# Sinh random secret:
# openssl rand -base64 32
# (copy output vào đây)

# =============================
# GOOGLE OAUTH
# =============================
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# =============================
# FIREBASE ADMIN (Server-side)
# =============================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# =============================
# FIREBASE CLIENT (Browser-side)
# =============================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Lưu ý quan trọng:**
- `FIREBASE_PRIVATE_KEY` phải giữ nguyên dấu `\n` như trong file JSON
- `NEXT_PUBLIC_*` là public, không bao giờ để secret ở đây
- `NEXTAUTH_SECRET` dùng `openssl rand -base64 32` để tạo

## Bước 11: Chạy development server

```bash
npm run dev
```

Truy cập: **http://localhost:3000**

✅ Nếu thấy trang login với nút "Tiếp tục với Google" → Thành công!

## Bước 12: Test đăng nhập

1. Click nút "Tiếp tục với Google"
2. Chọn tài khoản Google của bạn
3. Nếu thấy Dashboard → **Perfect!** ✨

---

## 🛠️ Troubleshooting

### Lỗi: "NEXTAUTH_SECRET is not set"
→ Thêm `NEXTAUTH_SECRET=your-random` vào `.env.local`

### Lỗi: "Firebase initialization failed"
→ Kiểm tra lại các key trong `.env.local`, không được có khoảng trắng

### Lỗi: "Firestore permission denied"
→ Firestore rules chưa được deploy. Chạy `npm run deploy:rules`

### Lỗi: "Google OAuth redirect_uri_mismatch"
→ URL redirect trong Google Console phải khớp: `http://localhost:3000/api/auth/callback/google`

### Database trống khi đăng nhập lần đầu?
→ Bình thường! NextAuth tạo user document tự động. Đăng xuất rồi đăng nhập lại.

---

## 📱 Tính năng sẵn sàng dùng

✅ Đăng nhập/Đăng xuất bằng Google  
✅ Thêm/Sửa/Xóa giao dịch  
✅ Dashboard với biểu đồ  
✅ Đặt ngân sách theo danh mục  
✅ Báo cáo + xuất CSV  
✅ Danh mục mặc định tự tạo khi user đầu tiên đăng nhập  

---

## 🚀 Deploy lên Vercel (sau này)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main

# Vào vercel.com → Import repo
# Thêm environment variables từ .env.local
# Deploy!
```

---

## 📚 Cấu trúc thư mục

```
expense-tracker/
├── app/
│   ├── (auth)/login/         ← Login page
│   ├── (dashboard)/          ← Protected pages
│   │   ├── page.tsx          ← Dashboard
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── reports/
│   ├── api/                  ← API routes
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/               ← React components
├── lib/
│   ├── firebase-admin.ts
│   ├── firebase-client.ts
│   ├── auth.ts               ← NextAuth config
│   ├── hooks.ts              ← React Query
│   └── utils.ts
├── types/
├── public/
└── .env.local                ← Your config (not in git)
```

---

Bất kỳ lỗi gì khi setup, hãy check:
1. `.env.local` có đúng không?
2. Firestore rules đã deploy?
3. Google OAuth credential đúng chưa?
4. Port 3000 có bị chiếm không?

Good luck! 🎉
