import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { adminDb } from "./firebase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // Lưu uid vào session để dùng trong API routes
    async signIn({ user }) {
      if (!user.email) return false;

      // Tạo user doc trong Firestore nếu chưa có
      const userRef = adminDb.collection("users").doc(user.id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          email: user.email,
          name: user.name,
          image: user.image,
          createdAt: new Date().toISOString(),
        });

        // Tạo các danh mục mặc định
        const defaultCategories = [
          { name: "Ăn uống", icon: "🍜", color: "#ef4444" },
          { name: "Di chuyển", icon: "🚗", color: "#f97316" },
          { name: "Mua sắm", icon: "🛍️", color: "#8b5cf6" },
          { name: "Giải trí", icon: "🎮", color: "#3b82f6" },
          { name: "Y tế", icon: "💊", color: "#10b981" },
          { name: "Hoá đơn", icon: "📄", color: "#6b7280" },
          { name: "Lương", icon: "💰", color: "#22c55e" },
          { name: "Khác", icon: "📦", color: "#94a3b8" },
        ];

        const batch = adminDb.batch();
        for (const cat of defaultCategories) {
          const catRef = userRef.collection("categories").doc();
          batch.set(catRef, { ...cat, userId: user.id });
        }
        await batch.commit();
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.id = token.uid as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
