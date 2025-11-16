"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SteamSignIn() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.username || "User"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium">
            {session.user.username || session.user.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("steam")}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-bold rounded border border-gray-600 hover:bg-gray-800 transition-colors"
    >
      <img
        src="/steam-icon.svg"
        alt="Steam"
        className="w-5 h-5"
      />
      Sign in with Steam
    </button>
  );
}
