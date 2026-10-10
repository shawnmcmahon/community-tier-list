import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { TIERS } from "@/lib/mock-data";

export default function HomePage() {
  const examples = ["Pizza", "Tacos", "Sushi", "Burgers", "Salad"];
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Nav variant="dark" />
      <main className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-6 text-sm font-bold uppercase tracking-widest text-amber-200">Your stream. Everyone&apos;s opinion.</p>
            <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">Make a tier list.<br /><span className="text-tier-s">Let the room decide.</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-gray-300">Stage an item, open the vote, and watch your audience rank it live. Compare your picks with the community, one tier at a time.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-lg bg-amber-200 px-6 py-3 font-bold text-gray-950 hover:bg-amber-100">Create a session</Link>
              <Link href="/login" className="rounded-lg border border-gray-700 px-6 py-3 font-semibold text-gray-200 hover:bg-gray-800">Sign in with Twitch</Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">Hosts sign in with Twitch. Viewers just need the session link.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-700 px-5 py-4"><span className="font-bold">The great food debate</span><span className="text-xs uppercase tracking-wider text-gray-400">Example board</span></div>
            {TIERS.map((tier, i) => <div key={tier} className="flex min-h-20 border-b border-gray-700 last:border-0">
              <span className={`flex w-20 shrink-0 items-center justify-center bg-tier-${tier.toLowerCase()} text-2xl font-black text-gray-950`}>{tier}</span>
              <div className="flex flex-1 items-center gap-3 p-3"><span className="rounded-md border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold">{examples[i]}</span></div>
            </div>)}
          </div>
        </div>
        <div className="mt-20 grid gap-8 border-t border-gray-700 pt-9 sm:grid-cols-3">
          {[['01', 'Build your pool', 'Add your own labels or import a TierMaker template.'], ['02', 'Invite the community', 'Share one link. Viewers vote with a click or a keyboard shortcut.'], ['03', 'Compare the verdict', 'Your board, their board, and each viewer’s personal picks stay together.']].map(([number, title, text]) => <div key={number}><span className="font-mono text-sm text-tier-a">{number}</span><h2 className="mt-3 text-xl font-bold">{title}</h2><p className="mt-2 leading-relaxed text-gray-400">{text}</p></div>)}
        </div>
      </main>
      <Footer variant="dark" />
    </div>
  );
}
