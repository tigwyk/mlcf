# Major League Coin Flipping (MLCF)

The premier destination for Q-Up strategies, builds, and guides. Because competitive coin flipping deserves to be taken seriously.

## About

Major League Coin Flipping is an interactive community website inspired by sites like u.gg, specifically built for **Q-Up** - the competitive coin flipping game on Steam. We embrace the absurdity of taking a coin flipping game as seriously as professional esports.

## Features

- **Pro Builds Database**: Share and browse skill builds with export strings
- **Strategy Guides**: Write and read in-depth guides with markdown support
- **Community Voting**: Upvote/downvote builds and guides
- **Tag System**: Organize and filter content by strategy type
- **Skill Export Parser**: Reverse-engineered parser for Q-Up skill export strings (WIP)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma ORM)
- **Deployment**: Ready for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd mlcf
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npx prisma migrate dev
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
mlcf/
├── app/
│   ├── api/
│   │   ├── builds/       # Build submission & retrieval API
│   │   └── guides/       # Guide submission & retrieval API
│   ├── builds/
│   │   ├── page.tsx      # Browse builds
│   │   └── submit/       # Submit new build
│   ├── guides/
│   │   ├── page.tsx      # Browse guides
│   │   └── submit/       # Write new guide
│   └── page.tsx          # Homepage
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   └── skillParser.ts    # Q-Up skill export parser
├── prisma/
│   └── schema.prisma     # Database schema
└── README.md
```

## Database Schema

### Build
- Skill build configurations with export strings
- Author, description, tags
- Voting and view counts

### Guide
- Strategy articles with markdown content
- Author, summary, tags
- Voting and view counts

### Tag
- Shared tagging system for builds and guides

### Comment
- Community discussion (structure ready, UI pending)

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# View database in Prisma Studio
npx prisma studio
```

## Skill Export Parser

The skill export parser (`lib/skillParser.ts`) is designed to decode Q-Up's skill export strings. Since Q-Up is closed-source and the format is undocumented, the parser currently:

1. Attempts common encoding formats (Base64, JSON)
2. Stores unrecognized formats for future analysis
3. Accepts any non-empty string as valid (to collect real examples)

**TODO**: As we collect real export strings from the community, we'll reverse-engineer the actual format and update the parser.

## Contributing

We welcome contributions! Areas that need work:

- [ ] Individual build/guide detail pages
- [ ] Comment system implementation
- [ ] User authentication
- [ ] Voting functionality (API routes exist, UI pending)
- [ ] Search functionality
- [ ] Skill export parser improvements
- [ ] Mobile responsive design improvements
- [ ] Markdown rendering for guide content

## Deployment

The site is ready to deploy on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables (if needed)
4. Deploy!

For production, consider upgrading from SQLite to PostgreSQL.

## License

MIT

## Acknowledgments

- Inspired by u.gg and other esports stats sites
- Built for the Q-Up community on Steam
- Taking coin flipping way too seriously since 2025

---

**Note**: This is an unofficial fan project and is not affiliated with the creators of Q-Up.
