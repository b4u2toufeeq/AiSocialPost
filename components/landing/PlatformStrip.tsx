"use client";

const platforms = [
  { name: "Instagram", color: "from-pink-500 to-purple-600" },
  { name: "Twitter / X", color: "from-blue-400 to-blue-600" },
  { name: "LinkedIn", color: "from-blue-600 to-blue-800" },
  { name: "Facebook", color: "from-blue-500 to-blue-700" },
  { name: "TikTok", color: "from-black to-gray-800" },
  { name: "YouTube", color: "from-red-500 to-red-700" },
  { name: "Pinterest", color: "from-red-600 to-red-800" },
  { name: "Threads", color: "from-gray-600 to-gray-800" },
  { name: "Bluesky", color: "from-sky-400 to-sky-600" },
  { name: "Mastodon", color: "from-purple-500 to-purple-700" },
  { name: "Telegram", color: "from-blue-400 to-cyan-500" },
];

export default function PlatformStrip() {
  return (
    <section className="py-16 border-y border-white/5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {platforms.map((p) => (
            <span
              key={p.name}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-zinc-300 hover:scale-105 transition-all cursor-default"
            >
              <span className={`bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>
                {p.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
