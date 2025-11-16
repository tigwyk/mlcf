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
        viewBox="0 0 233 233"
        className="w-5 h-5"
        fill="currentColor"
      >
        <path d="M4.89 150.01c4.15 14.62 11.59 27.98 21.54 38.93 14.22-7.14 25.96-19.92 32.53-35.26l.02-.05c1.61-3.78 2.79-7.71 3.53-11.73a46.61 46.61 0 0 0-18.25 1.06l-.05.02-39.32 7.03zm45.39-4.7c-1.88 10.37-6.99 19.75-14.35 27.14l-.01.01c-7.7 7.73-17.8 12.66-28.87 14.02 7.14 6.37 15.43 11.51 24.45 15.17a101.19 101.19 0 0 0 11.97 4.19c23.81 6.75 49.82 4.35 71.73-7.08l-47.75-23.3c-8.53-4.17-14.49-12.03-16.17-21.15zm170.82-29.51c0-31.98-18.79-59.56-45.9-72.37v-.01c-4.52-2.14-9.27-3.88-14.18-5.19a101.85 101.85 0 0 0-21.15-3.26 101.19 101.19 0 0 0-23.32.87 101.34 101.34 0 0 0-11.52 2.37L93.25 45.3l11.28 22.36 22.32-11.25a69.07 69.07 0 0 1 12.27-4.87 69.63 69.63 0 0 1 15.95-1.84c5.39 0 10.66.62 15.73 1.79a69.3 69.3 0 0 1 14.47 5.36c24.26 11.47 41.08 36.14 41.08 64.95 0 39.5-32.05 71.55-71.55 71.55-13.42 0-25.99-3.71-36.71-10.14l-.04-.03-28.57 14.38c16.09 10.89 35.51 17.24 56.32 17.24 54.98 0 99.55-44.57 99.55-99.55z" />
        <ellipse cx="163.52" cy="115.62" rx="37.02" ry="37.02" />
      </svg>
      Sign in with Steam
    </button>
  );
}
