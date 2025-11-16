import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Major League
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Coin Flipping
            </span>
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            The Premier Destination for Q-Up Strategies
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Because every flip matters. Because we take coin flipping very seriously.
            Welcome to the competitive scene.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/calculator"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Skill Calculator
            </Link>
            <Link
              href="/builds"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Browse Builds
            </Link>
            <Link
              href="/guides"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Read Guides
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🧮</div>
            <h3 className="text-xl font-bold mb-3">Skill Calculator</h3>
            <p className="text-gray-400">
              Build your perfect loadout with our interactive hexagonal grid calculator.
              Place skills, plan combos, and export your build to share with the community.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🪙</div>
            <h3 className="text-xl font-bold mb-3">Pro Builds</h3>
            <p className="text-gray-400">
              Share and discover championship-winning skill builds. Export your Q-Up
              configuration and let the community analyze your winning strategies.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-3">Strategy Guides</h3>
            <p className="text-gray-400">
              Deep-dive articles covering advanced tactics, psychology, and game theory
              for competitive coin flipping. Written by the community, for the community.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>Major League Coin Flipping - An unofficial Q-Up community resource</p>
          <p className="text-sm mt-2">Taking competitive coin flipping way too seriously since 2025</p>
        </div>
      </footer>
    </div>
  );
}
