import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPlayerGameStats } from "@/lib/steam-stats";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    // Verify OpenID response
    const openidMode = searchParams.get("openid.mode");
    const claimedId = searchParams.get("openid.claimed_id");

    if (openidMode !== "id_res" || !claimedId) {
      return NextResponse.redirect(`${baseUrl}/?error=invalid_openid_response`);
    }

    // Build verification params
    const verifyParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      verifyParams.append(key, value);
    });
    verifyParams.set("openid.mode", "check_authentication");

    // Verify with Steam
    const verifyResponse = await fetch(
      "https://steamcommunity.com/openid/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: verifyParams.toString(),
      }
    );

    const verifyText = await verifyResponse.text();

    if (!verifyText.includes("is_valid:true")) {
      return NextResponse.redirect(`${baseUrl}/?error=steam_verification_failed`);
    }

    // Extract Steam ID
    const steamId = claimedId.split("/").pop();

    if (!steamId) {
      return NextResponse.redirect(`${baseUrl}/?error=no_steam_id`);
    }

    // Fetch player data from Steam API
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return NextResponse.redirect(`${baseUrl}/?error=steam_api_key_missing`);
    }

    const playerResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
    );

    const playerData = await playerResponse.json();
    const player = playerData.response?.players?.[0];

    if (!player) {
      return NextResponse.redirect(`${baseUrl}/?error=steam_api_failed`);
    }

    // Clean up username - remove consecutive duplicate words
    let username = player.personaname;
    console.log('[Steam Callback] Original personaname from Steam:', JSON.stringify(username));
    console.log('[Steam Callback] Username length:', username.length);
    console.log('[Steam Callback] Username char codes:', [...username].map(c => c.charCodeAt(0)));
    
    if (username.includes(' ')) {
      const words = username.split(' ');
      console.log('[Steam Callback] Split into words:', words);
      const uniqueWords = words.filter((word: string, i: number) => i === 0 || word !== words[i-1]);
      console.log('[Steam Callback] After dedup:', uniqueWords);
      username = uniqueWords.join(' ');
      console.log('[Steam Callback] Final username:', JSON.stringify(username));
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { steamId },
      create: {
        steamId,
        username,
        avatar: player.avatarfull,
      },
      update: {
        username,
        avatar: player.avatarfull,
      },
    });

    // Fetch Q-Up game stats
    const gameStats = await getPlayerGameStats(steamId);

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.user = {
      id: user.id,
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar,
      qupPlaytime: gameStats?.playtimeForever,
      ownsQup: gameStats?.ownsGame,
      achievementsUnlocked: gameStats?.achievementsUnlocked,
      achievementsTotal: gameStats?.achievementsTotal,
      achievementPercentage: gameStats?.achievementPercentage,
    };
    await session.save();

    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(`${baseUrl}/?error=auth_exception`);
  }
}
