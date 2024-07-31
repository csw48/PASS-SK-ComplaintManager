import Sidebar from '../components/Sidebar';

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold mb-4">Spravca Reklamacii</h1>
        <p>This is the main content area.</p>
      </main>
    </div>
  );
}