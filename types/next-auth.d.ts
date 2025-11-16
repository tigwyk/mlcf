import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      steamId?: string;
      username?: string;
    };
  }

  interface User {
    steamId: string;
    username: string;
    avatar?: string | null;
  }
}
