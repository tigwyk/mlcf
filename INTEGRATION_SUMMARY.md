# Steam OAuth Integration - Summary

Steam authentication has been successfully integrated into the MLCF project.

## What Was Added

### Database Schema Changes
- **User** model: Stores Steam ID, username, and avatar
- **Account** model: NextAuth provider linking
- **Session** model: Database-backed authentication sessions
- Updated **Build**, **Guide**, and **Comment** models to reference User via `authorId`

Migration: `20251116192649_add_steam_auth`

### Authentication Files
- `lib/steam-provider.ts` - Custom Steam OpenID 2.0 provider
- `lib/auth.ts` - NextAuth v5 configuration with Prisma adapter
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API endpoints
- `types/next-auth.d.ts` - TypeScript declarations for custom session

### Components
- `components/SessionProvider.tsx` - Client-side session wrapper
- `components/SteamSignIn.tsx` - Sign in/out button with user display

### Protected API Routes
Updated to require authentication:
- `POST /api/builds` - Now checks session and uses `session.user.id` as author
- `POST /api/guides` - Now checks session and uses `session.user.id` as author

### Documentation
- `STEAM_OAUTH_SETUP.md` - Complete setup guide
- `.env.example` - Environment variable template
- Updated `WARP.md` - Architectural documentation

## Next Steps

### Required: Get Steam API Key
1. Visit https://steamcommunity.com/dev/apikey
2. Register with domain `localhost` for development
3. Add key to `.env` as `STEAM_API_KEY`

### For Production (Railway)
Set these environment variables:
```bash
STEAM_API_KEY=your_production_steam_api_key
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=https://your-production-domain.com
```

## Testing

To test locally:
```bash
# 1. Get your Steam API key (see above)
# 2. Add it to .env
# 3. Start the dev server
npm run dev

# Visit http://localhost:3000
# Click "Sign in with Steam" button
# Authorize on Steam
# You should be redirected back and signed in
```

## Usage Examples

### In Components
```tsx
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();
  
  if (!session) {
    return <button onClick={() => signIn("steam")}>Sign in</button>;
  }
  
  return (
    <div>
      Welcome {session.user.username}!
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}
```

### In Server Components / API Routes
```tsx
import { auth } from "@/lib/auth";

export async function MyServerComponent() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  return <div>Welcome {session.user.username}!</div>;
}
```

## What Changed

### Breaking Changes
- Build and Guide creation now **requires authentication**
- API calls to `POST /api/builds` and `POST /api/guides` without authentication will return 401
- The `author` field changed from a string to a User relation

### Migration Notes
- Old data with string authors has been cleared (database was reset)
- All builds/guides moving forward will have proper user attribution
- Sessions are stored in the database (not JWT)

## Architecture

```
User signs in
    ↓
Steam OpenID 2.0
    ↓
Custom Steam Provider (lib/steam-provider.ts)
    ↓
NextAuth v5 (lib/auth.ts)
    ↓
Prisma Adapter
    ↓
PostgreSQL Database (User, Account, Session tables)
```

## Files Modified
- `prisma/schema.prisma` - Added auth models
- `app/api/builds/route.ts` - Added auth check
- `app/api/guides/route.ts` - Added auth check
- `app/layout.tsx` - Added SessionProvider
- `.env` - Added NextAuth and Steam config
- `WARP.md` - Updated documentation

## Files Created
- `lib/steam-provider.ts`
- `lib/auth.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `components/SessionProvider.tsx`
- `components/SteamSignIn.tsx`
- `types/next-auth.d.ts`
- `.env.example`
- `STEAM_OAUTH_SETUP.md`
- `INTEGRATION_SUMMARY.md` (this file)

## Dependencies Added
- `next-auth@5.0.0-beta.30`
- `@auth/prisma-adapter`
- `openid`

## Build Status
✅ Project builds successfully
✅ Prisma migrations applied
✅ TypeScript compilation passes
