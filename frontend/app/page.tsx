import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">
        HFiles Medical Dashboard
      </h1>

      <Link
        href="/login"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Login
      </Link>

      <Link
        href="/signup"
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Sign Up
      </Link>
    </div>
  );
}