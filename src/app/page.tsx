import Link from "next/link";
import { requireSession } from "@/lib/require-session";

export default async function Home() {
  const session = await requireSession();

  return (
    <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden p-6">
      <img
        src="/welcome-bg.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-7 rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hey {session.userName}, schön dich zu sehen!
          </h1>
          <p className="mt-2 text-gray-600">
            Dein Hab und Gut im Griff – ran an die Gegenstände!
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/items"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-white shadow-lg transition hover:bg-indigo-700"
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="h-5 w-5 shrink-0"
            >
              <path d="M50 12 L88 32 V70 L50 90 L12 70 V32 Z" />
              <path d="M12 32 L50 52 L88 32" />
              <path d="M50 52 V90" />
            </svg>
            <span className="font-semibold">Gegenstände</span>
          </Link>

          <Link
            href="/shopping-list"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-6 py-3.5 text-white shadow-lg transition hover:bg-fuchsia-700"
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="h-5 w-5 shrink-0"
            >
              <path d="M8 16 H22 L34 62 H78 L90 26 H28" />
              <circle cx="40" cy="82" r="8" />
              <circle cx="74" cy="82" r="8" />
            </svg>
            <span className="font-semibold">Einkaufsliste</span>
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Version vom{" "}
          {new Date(
            process.env.NEXT_PUBLIC_BUILD_TIME ?? Date.now(),
          ).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>
    </main>
  );
}
