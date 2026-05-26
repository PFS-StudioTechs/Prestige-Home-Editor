import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-brand-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-brand-900 mb-4">
        Visualisez votre cuisine rénovée
      </h1>
      <p className="text-lg text-brand-600 mb-2 max-w-md">
        Appliquez les films Cover Styl&apos; sur vos photos et obtenez un devis en quelques clics.
      </p>
      <p className="text-sm text-gray-400 mb-10">
        Sans engagement · Sans installation · Depuis votre smartphone
      </p>
      <Link
        href="/dashboard"
        className="px-8 py-3 bg-brand-500 text-white rounded-xl font-medium text-base hover:bg-brand-600 transition-colors shadow-sm"
      >
        Commencer →
      </Link>
    </main>
  );
}
