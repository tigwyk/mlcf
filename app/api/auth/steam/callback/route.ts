import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { steamId },
      create: {
        steamId,
        username: player.personaname,
        avatar: player.avatarfull,
      },
      update: {
        username: player.personaname,
        avatar: player.avatarfull,
      },
    });

    // Create session
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.user = {
      id: user.id,
      steamId: user.steamId,
      username: user.username,
      avatar: user.avatar,
    };
    await session.save();

    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error("Steam callback error:", error);
    return NextResponse.redirect(`${baseUrl}/?error=auth_exception`);
  }
}
