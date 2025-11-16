"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  steamId: string;
  username: string;
  avatar: string | null;
  qupPlaytime?: number;
  ownsQup?: boolean;
}

export default function SteamSignIn() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/steam/session")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSignOut = () => {
    window.location.href = "/api/auth/steam/logout";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const formatPlaytime = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours.toLocaleString()}h` : `${minutes}m`;
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.avatar && (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user.username}
            </span>
            {user.ownsQup && user.qupPlaytime !== undefined && (
              <span className="text-xs text-gray-400">
                Q-Up: {formatPlaytime(user.qupPlaytime)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/steam/login"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-bold rounded border border-gray-600 hover:bg-gray-800 transition-colors"
    >
      <img
        src="/steam-icon.svg"
        alt="Steam"
        className="w-5 h-5"
      />
      Sign in with Steam
    </a>
  );
}
