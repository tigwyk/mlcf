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
      className="flex items-center gap-2 px-4 py-2 bg-[#171a21] text-white rounded hover:bg-[#1b2838] transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        className="w-5 h-5"
        fill="currentColor"
      >
        <path d="M128 0C57.308 0 0 57.307 0 128c0 65.473 49.166 119.385 112.5 127.296V256l32.5-32.5H176c10.976 0 20.488-5.495 28.062-13.062C211.505 202.976 217 193.464 217 182.488v-32.5l32.5-32.5V76.5c0-7.732-6.268-14-14-14h-41.988L128 0zm-15.625 28.125l38.75 38.75H99.375l-15.625-15.625L115.375 28.125zM224 224H32c-8.837 0-16-7.163-16-16V48c0-8.837 7.163-16 16-16h192c8.837 0 16 7.163 16 16v160c0 8.837-7.163 16-16 16z" />
      </svg>
      Sign in with Steam
    </button>
  );
}
