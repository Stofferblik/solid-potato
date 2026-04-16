import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Gebruikersnaam", type: "text" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;
        const validUsername = process.env.PO_USERNAME ?? "admin";
        const validPassword = process.env.PO_PASSWORD ?? "admin123";

        if (username === validUsername && password === validPassword) {
          return {
            id: "1",
            name: "Product Owner",
            email: "po@app.nl",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
