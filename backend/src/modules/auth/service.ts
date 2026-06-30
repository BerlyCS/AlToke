import { status } from "elysia";
import { db } from "../../db";
import { users, privacySettings } from "../../db/schema";
import { eq } from "drizzle-orm";
import type { AuthModel } from "./model";
import { password as bunPassword } from "bun";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export abstract class AuthService {
  static async register(data: AuthModel["registerBody"]) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (existing.length > 0) {
      throw status(
        400,
        "Email already in use" satisfies AuthModel["registerError"],
      );
    }

    const hashedPassword = await bunPassword.hash(data.password);

    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: hashedPassword,
        nickname: data.nickname,
      })
      .returning();

    await db.insert(privacySettings).values({
      userId: user.id,
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    };
  }

  static async login(data: AuthModel["loginBody"]) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user || !user.passwordHash) {
      throw status(401, "Invalid credentials" satisfies AuthModel["authError"]);
    }

    const isValid = await bunPassword.verify(data.password, user.passwordHash);
    if (!isValid) {
      throw status(401, "Invalid credentials" satisfies AuthModel["authError"]);
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    };
  }

  static async googleLogin(data: AuthModel["googleLoginBody"]) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw status(
          401,
          "Invalid credentials" satisfies AuthModel["authError"],
        );
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, payload.email))
        .limit(1);

      if (existingUser) {
        return {
          id: existingUser.id,
          email: existingUser.email,
          nickname: existingUser.nickname,
          avatarUrl: existingUser.avatarUrl,
        };
      }

      const [newUser] = await db
        .insert(users)
        .values({
          email: payload.email,
          nickname: payload.name || null,
          avatarUrl: payload.picture || null,
        })
        .returning();

      await db.insert(privacySettings).values({
        userId: newUser.id,
      });

      return {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        avatarUrl: newUser.avatarUrl,
      };
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);
      throw status(401, "Invalid credentials" satisfies AuthModel["authError"]);
    }
  }
}
