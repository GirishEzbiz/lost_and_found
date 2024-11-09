// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Simulate checking for admin credentials
        if (email === "jp@gmail.com" && password === "123456") {
          return { email, isAdmin: true }; // Admin credentials
        } else if (email === "user@example.com" && password === "user123") {
          return { email, isAdmin: false }; // Regular user credentials
        }

        // If credentials are incorrect, return null
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin; // Add isAdmin flag to the token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAdmin = token.isAdmin; // Add isAdmin flag to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Customize the login page URL if needed
    error: "/auth/error", // Customize the error page URL if needed
  },
});
