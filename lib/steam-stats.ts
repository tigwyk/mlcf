// Q-Up Steam App ID
export const QUPUP_APP_ID = "2722510";

export interface GameStats {
  playtimeForever: number; // in minutes
  playtime2Weeks?: number; // in minutes
  lastPlayed?: number; // unix timestamp
  ownsGame: boolean;
}

export async function getPlayerGameStats(
  steamId: string
): Promise<GameStats | null> {
  const apiKey = process.env.STEAM_API_KEY;
  if (!apiKey) {
    console.error("STEAM_API_KEY not configured");
    return null;
  }

  try {
    // Get owned games with playtime
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&appids_filter[0]=${QUPUP_APP_ID}&include_played_free_games=1&include_appinfo=1`
    );

    const data = await response.json();

    if (!data.response || !data.response.games || data.response.games.length === 0) {
      return {
        playtimeForever: 0,
        ownsGame: false,
      };
    }

    const game = data.response.games[0];

    return {
      playtimeForever: game.playtime_forever || 0,
      playtime2Weeks: game.playtime_2weeks,
      lastPlayed: game.rtime_last_played,
      ownsGame: true,
    };
  } catch (error) {
    console.error("Error fetching Steam game stats:", error);
    return null;
  }
}

export function formatPlaytime(minutes: number): string {
  if (minutes === 0) return "0 hours";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} minutes`;
  }

  if (mins === 0) {
    return `${hours.toLocaleString()} hours`;
  }

  return `${hours.toLocaleString()}h ${mins}m`;
}
