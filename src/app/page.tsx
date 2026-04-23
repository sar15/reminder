import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          CA Compliance Shield
        </h1>
        <p className="text-xl text-gray-600">
          Timestamped, court-admissible proof of every client communication.
          Stop getting blamed for penalties you didn&apos;t cause.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
