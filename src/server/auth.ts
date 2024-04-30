import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/env";
import { decrypt } from "@/lib/utils";
import { db } from "@/server/db";
import { LoginFormSchema } from "@/types/forms";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
  }
}
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
        role: {
          label: "Role",
          type: "text",
        },
      },
      async authorize(credentials) {
        try {
          LoginFormSchema.parse(credentials);
        } catch (error) {
          throw new Error("Invalid Credentials");
        }
        const { role, email, password } = LoginFormSchema.parse(credentials);
        if (role === "ADMIN") {
          const admin = await db.admin.findFirst({
            where: {
              email,
            },
          });
          if (!admin) {
            throw new Error("Invalid Credentials");
          }
          const dbPassword = decrypt(admin.password);
          if (password !== dbPassword) {
            throw new Error("Invalid Credentials");
          }
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: "ADMIN",
          };
        } else {
          const user = await db.user.findFirst({
            where: {
              email,
            },
          });
          if (!user) {
            throw new Error("Invalid Credentials");
          }
          const dbPassword = decrypt(user.password);
          if (password !== dbPassword) {
            throw new Error("Invalid Credentials");
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: "USER",
          };
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
        };
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        return Promise.resolve({ ...user });
      } else {
        return Promise.resolve(token);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
