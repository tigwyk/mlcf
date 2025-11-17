"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  id: string;
  steamId: string;
  username: string;
  avatar: string | null;
  qupPlaytime?: number;
  ownsQup?: boolean;
  achievementsUnlocked?: number;
  achievementsTotal?: number;
  achievementPercentage?: number;
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
            <Image
              src={user.avatar}
              alt={user.username}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {user.username}
              </span>
              {user.achievementPercentage === 100 && (
                <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">
                  💯
                </span>
              )}
            </div>
            {user.ownsQup && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {user.qupPlaytime !== undefined && (
                  <span>{formatPlaytime(user.qupPlaytime)}</span>
                )}
                {user.achievementsTotal && user.achievementsTotal > 0 && (
                  <span>
                    🏆 {user.achievementsUnlocked}/{user.achievementsTotal}
                  </span>
                )}
              </div>
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
