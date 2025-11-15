# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Major League Coin Flipping (MLCF) is a community website for Q-Up, a competitive coin flipping game on Steam. The project takes the absurd premise seriously, providing builds, guides, and community features similar to esports sites like u.gg.

## Development Commands

### Setup
```bash
npm install
npx prisma migrate dev  # Initialize database
npm run dev             # Start dev server on http://localhost:3000
```

### Daily Development
```bash
npm run dev             # Development server
npm run build           # Production build
npm run lint            # Run ESLint
```

### Database Management
```bash
npx prisma generate                        # Generate Prisma client after schema changes
npx prisma migrate dev --name <name>       # Create new migration
npx prisma studio                          # Open database GUI
npx prisma db push                         # Push schema changes without migration (dev only)
```

## Architecture

### Core Structure

This is a **Next.js 16 App Router** project with the following key architecture decisions:

1. **Database Layer**: SQLite via Prisma ORM
   - Prisma client is generated to `app/generated/prisma` (non-standard location)
   - Singleton pattern in `lib/prisma.ts` prevents multiple instances
   - Schema supports builds, guides, tags (many-to-many), and comments

2. **API Layer**: RESTful API routes in `app/api/`
   - `POST /api/builds` - Create build with tags (upsert pattern)
   - `GET /api/builds?sortBy=<field>&order=<asc|desc>&tag=<name>` - List/filter builds
   - `POST /api/guides` - Create guide with tags (upsert pattern)
   - `GET /api/guides?sortBy=<field>&order=<asc|desc>&tag=<name>` - List/filter guides
   - All routes use `NextRequest`/`NextResponse` (no edge runtime)

3. **Domain Logic**: The Q-Up Skill Parser (`lib/skillParser.ts`)
   - **Export Format Discovered**: `QUP-LOADOUT-v1:{base64-encoded-json}`
   - JSON structure:
     ```typescript
     {
       character: number,  // Character ID (1 = Leila the Medic)
       nodes: Array<{
         name: string,          // Empty for unlocked hex nodes/placeholders
         guid: string,          // Unique skill identifier
         level: number,         // Skill level
         gridPosition: {x, y, z},  // Cubic hex coordinates (x+y+z=0)
         isInventory: boolean   // false for placed skills
       }>
     }
     ```
   - Parser filters out empty nodes to extract only named skills
   - Skill trigger types, charge counts, and connections are NOT in export (must be hardcoded by skill GUID)

4. **Data Model Patterns**:
   - Tags are shared between builds and guides (many-to-many relations)
   - Voting system: separate `upvotes`/`downvotes` counters (no vote history)
   - Comments schema exists but has no UI implementation yet
   - All models use `cuid()` for IDs

### Important Quirks

- **Prisma Client Path**: Generated to `app/generated/prisma` instead of `node_modules/.prisma/client`
  - Always import from `@/app/generated/prisma`, not `@prisma/client`
  - If schema changes, run `npx prisma generate` before running the app

- **Path Aliases**: `@/*` maps to project root (see `tsconfig.json`)

- **Database**: Uses SQLite (`file:./dev.db`) in development
  - For production deployment, migrate to PostgreSQL
  - Current schema uses no SQLite-specific features

## Current State & Known Gaps

### Not Implemented
- Individual build/guide detail pages (only list views exist)
- Comment system UI (schema exists, no routes/components)
- User authentication (authors are just strings)
- Voting UI (vote counters exist but can't be modified via UI)
- Search functionality
- Markdown rendering for guides (stored as raw markdown)

### Q-Up Game Mechanics
Q-Up is a competitive coin flipping game with a complex skill system:

**Skill Grid System:**
- Skills are placed on a **hexagonal grid** using cubic coordinates (x, y, z)
- Grid positions are numbered sequentially (1-181+) for activation order
- **Hex skills** (e.g., Level 50, Level 40) are fixed unlocks at specific positions
- **Round skills** (e.g., Battle Medic, Angel) can be placed anywhere

**Skill Mechanics:**
- Skills have **charges** (dots below skill icon) - number of times they can activate per coinflip
- Once depleted, skills recharge for the next coinflip
- Skills can trigger other skills, creating chain reactions
- Trigger types: ON FLIP, ON WIN, ON LOSS, ON TRIGGER
- Skills execute in grid number order, but chains can interrupt sequence

**Skill Export Format:**
- Format: `QUP-LOADOUT-v1:{base64-json}` (see parser for full structure)
- Export contains character, skill placements, and grid positions
- Does NOT contain trigger types or charge counts (lookup required by GUID)

## Code Patterns

### Tag Creation Pattern
When creating builds/guides, use the upsert pattern for tags:
```typescript
const tagConnections = await Promise.all(
  tags.map(async (tagName: string) => {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    });
    return { id: tag.id };
  })
);
```

### API Error Handling
All API routes follow this pattern:
- Validate required fields → 400
- Business logic errors → 400 with specific message
- Unexpected errors → 500 with generic message
- Log errors to console (no logging service configured)

## Deployment Notes

- Ready for Vercel deployment (Next.js 16)
- Set `DATABASE_URL` environment variable for production
- Upgrade from SQLite to PostgreSQL for production use
- No environment-specific config files exist (relies on Next.js defaults)
