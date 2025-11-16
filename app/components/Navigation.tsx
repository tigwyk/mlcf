import Link from 'next/link';
import SteamSignIn from '@/components/SteamSignIn';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-blue-400">MLCF</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/calculator" className="hover:text-green-400 transition-colors">
              Calculator
            </Link>
            <Link href="/builds" className="hover:text-blue-400 transition-colors">
              Builds
            </Link>
            <Link href="/guides" className="hover:text-purple-400 transition-colors">
              Guides
            </Link>
            <SteamSignIn />
          </div>
        </div>
      </div>
    </nav>
  );
}
