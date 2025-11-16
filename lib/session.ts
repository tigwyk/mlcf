import { SessionOptions } from "iron-session";

export interface SessionData {
  user?: {
    id: string;
    steamId: string;
    username: string;
    avatar: string | null;
  };
}

export const sessionOptions: SessionOptions = {
  password: process.env.NEXTAUTH_SECRET!,
  cookieName: "mlcf_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
