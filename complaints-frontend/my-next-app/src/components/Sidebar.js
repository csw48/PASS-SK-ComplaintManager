import Link from 'next/link';
import Image from 'next/image';
import { HomeIcon, DocumentDuplicateIcon, PlusCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // Use v2 Heroicons

const Sidebar = () => {
  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex flex-col">
      <div className="flex items-center justify-center mt-10">
        <Image src="/app/logo.png" alt="Logo" width={100} height={100} />
      </div>
      <nav className="mt-10">
        <Link href="/" className="flex items-center p-2 text-base font-normal text-white hover:bg-gray-700">
          <HomeIcon className="w-6 h-6" />
          <span className="ml-3">Domov</span>
        </Link>
        <Link href="/internal-complaints" className="flex items-center p-2 text-base font-normal text-white hover:bg-gray-700">
          <DocumentDuplicateIcon className="w-6 h-6" />
          <span className="ml-3">Interné Reklamácie</span>
        </Link>
        <Link href="/components/external-complaints" className="flex items-center p-2 text-base font-normal text-white hover:bg-gray-700">
          <DocumentDuplicateIcon className="w-6 h-6" />
          <span className="ml-3">Externé Reklamácie</span>
        </Link>
        <Link href="/create-complaint" className="flex items-center p-2 text-base font-normal text-white hover:bg-gray-700">
          <PlusCircleIcon className="w-6 h-6" />
          <span className="ml-3">Vytvoriť Reklamáciu</span>
        </Link>
        <Link href="/statistics" className="flex items-center p-2 text-base font-normal text-white hover:bg-gray-700">
          <ChartBarIcon className="w-6 h-6" />
          <span className="ml-3">Štatistiky</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;