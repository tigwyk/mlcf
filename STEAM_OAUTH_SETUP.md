# Steam OAuth Setup

This guide explains how to set up Steam authentication for the MLCF website.

## Getting Your Steam API Key

1. Visit [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
2. Log in with your Steam account
3. Enter a domain name:
   - **Development**: `localhost`
   - **Production**: Your production domain (e.g., `mlcf-production.up.railway.app`)
4. Agree to the terms and click "Register"
5. Copy your API key

## Configuration

### Local Development

1. Copy `.env.example` to `.env` (if not already done)
2. Add your Steam API key to `.env`:
   ```
   STEAM_API_KEY="your_steam_api_key_here"
   ```
3. The `NEXTAUTH_SECRET` is already generated
4. Make sure `NEXTAUTH_URL="http://localhost:3000"`

### Production (Railway)

Add the following environment variables to your Railway project:

```bash
railway variables set STEAM_API_KEY="your_production_steam_api_key"
railway variables set NEXTAUTH_SECRET="your_generated_secret"
railway variables set NEXTAUTH_URL="https://mlcf-production.up.railway.app"
```

**Important**: Use a different Steam API key for production (registered with your production domain).

## How It Works

### Authentication Flow

1. User clicks "Sign in with Steam"
2. Redirects to Steam OpenID login
3. User authorizes on Steam
4. Steam redirects back with user's Steam ID
5. App fetches user profile from Steam API
6. User record is created/updated in database
7. Session is created

### Database Models

- **User**: Stores Steam ID, username, and avatar
- **Account**: NextAuth account linking (provider = "steam")
- **Session**: Database-backed sessions

### Protected Routes

API routes for creating builds and guides now require authentication:
- `POST /api/builds` - Returns 401 if not authenticated
- `POST /api/guides` - Returns 401 if not authenticated

The authenticated user is automatically set as the author.

## Usage in Components

### Check Authentication Status

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Welcome {session.user.username}!</div>;
}
```

### Sign In/Out

```tsx
import { signIn, signOut } from "next-auth/react";

// Sign in
<button onClick={() => signIn("steam")}>Sign in with Steam</button>

// Sign out
<button onClick={() => signOut()}>Sign out</button>
```

### Server-Side Authentication

```tsx
import { auth } from "@/lib/auth";

export async function MyServerComponent() {
  const session = await auth();
  
  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome {session.user.username}!</div>;
}
```

## Testing

1. Start the dev server: `npm run dev`
2. Visit http://localhost:3000
3. Click "Sign in with Steam"
4. Authorize on Steam
5. You should be redirected back and signed in

## Troubleshooting

### "STEAM_API_KEY is not configured"
- Make sure `.env` contains `STEAM_API_KEY`
- Restart your dev server after updating `.env`

### Steam login fails
- Check that your Steam API key domain matches your environment:
  - Development: `localhost`
  - Production: Your production domain
- Make sure the key is valid (not revoked)

### Database errors
- Run `npx prisma generate` to regenerate the client
- Run `npx prisma migrate dev` to apply migrations

## Security Notes

- Sessions are stored in the database (not JWT)
- Steam API key is never exposed to the client
- All Steam communication happens server-side
- Steam OpenID 2.0 is a secure authentication protocol
