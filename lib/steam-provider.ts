import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

export interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

export default function SteamProvider(
  options: OAuthUserConfig<SteamProfile>
): OAuthConfig<SteamProfile> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const callbackUrl = `${baseUrl}/api/auth/callback/steam`;
  
  return {
    id: "steam",
    name: "Steam",
    type: "oidc",
    issuer: "https://steamcommunity.com",
    authorization: {
      url: "https://steamcommunity.com/openid/login",
      params: {
        "openid.mode": "checkid_setup",
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.return_to": callbackUrl,
        "openid.realm": baseUrl,
      },
    },
    token: {
      url: "https://steamcommunity.com/openid/login",
      async request(context: any) {
        // Steam OpenID 2.0 doesn't use tokens, extract steamid from return URL
        const params = context.params;
        const claimedId = params?.["openid.claimed_id"] as string;
        const steamId = claimedId?.split("/").pop();

        if (!steamId) {
          throw new Error("Failed to extract Steam ID");
        }

        return {
          tokens: {
            steamId,
            access_token: steamId, // Use steamId as token for compatibility
          },
        };
      },
    },
    userinfo: {
      url: "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
      async request(context: any) {
        const steamId = context.tokens.access_token;
        const apiKey = process.env.STEAM_API_KEY;

        if (!apiKey) {
          throw new Error("STEAM_API_KEY is not configured");
        }

        // Fetch user profile from Steam API
        const response = await fetch(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`
        );

        const data = await response.json();
        const player = data.response?.players?.[0];

        if (!player) {
          throw new Error("Failed to fetch Steam profile");
        }

        return {
          steamid: player.steamid,
          personaname: player.personaname,
          avatarfull: player.avatarfull,
          profileurl: player.profileurl,
        };
      },
    },
    profile(profile) {
      return {
        id: profile.steamid,
        steamId: profile.steamid,
        username: profile.personaname,
        name: profile.personaname,
        image: profile.avatarfull,
        avatar: profile.avatarfull,
        email: null, // Steam doesn't provide email via OpenID
      };
    },
    style: {
      brandColor: "#000000",
    },
    options,
  };
}
