import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy & Data — Community Tier Lists",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00ff04_1px,transparent_1px),linear-gradient(to_bottom,#00ffff04_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <Nav variant="dark" />
      <main className="relative mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
          Privacy & Data
        </h1>
        <p className="mt-4 text-lg text-gray-400 leading-relaxed">
          We believe in transparency. Here&apos;s exactly what data we collect,
          what we don&apos;t, and how we use it.
        </p>

        <div className="mt-12 space-y-12">
          <Section title="What we store">
            <ul className="space-y-3">
              <ListItem positive>
                <strong className="text-gray-200">Twitch User ID</strong> — used as your unique identifier
              </ListItem>
              <ListItem positive>
                <strong className="text-gray-200">Twitch Display Name</strong> — shown in session dashboards
              </ListItem>
              <ListItem positive>
                <strong className="text-gray-200">Profile Picture URL</strong> — displayed alongside your sessions
              </ListItem>
              <ListItem positive>
                <strong className="text-gray-200">Votes</strong> — your S/A/B/C/D votes tied to a voter key
              </ListItem>
              <ListItem positive>
                <strong className="text-gray-200">Participation timestamps</strong> — when you joined sessions and last voted
              </ListItem>
            </ul>
          </Section>

          <Section title="What we do NOT store">
            <ul className="space-y-3">
              <ListItem negative>
                <strong className="text-gray-200">Email address</strong> — we never request or store your email
              </ListItem>
              <ListItem negative>
                <strong className="text-gray-200">Twitch OAuth tokens</strong> — used only during sign-in, never persisted
              </ListItem>
              <ListItem negative>
                <strong className="text-gray-200">Stream data</strong> — we never access your follower count, subscriptions, or stream analytics
              </ListItem>
              <ListItem negative>
                <strong className="text-gray-200">Chat messages</strong> — we have zero access to your Twitch chat
              </ListItem>
            </ul>
          </Section>

          <Section title="OAuth Scopes">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
              <div className="flex items-center gap-3 mb-3">
                <code className="rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1 text-sm font-mono font-bold text-fuchsia-400">
                  openid
                </code>
                <span className="text-sm text-gray-500">
                  — the only scope we request
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                This scope provides your Twitch user ID and display name via
                OpenID Connect. It does not grant access to your email,
                followers, subscriptions, or any other Twitch data.
              </p>
            </div>
          </Section>

          <Section title="Third-Party Services">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 hover:border-fuchsia-500/20 transition-colors">
                <h4 className="font-bold text-white mb-1">Convex</h4>
                <p className="text-sm text-gray-400">
                  Cloud database for sessions, items, votes, and user profiles.
                  Data stored in Convex&apos;s infrastructure.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 hover:border-cyan-500/20 transition-colors">
                <h4 className="font-bold text-white mb-1">Twitch</h4>
                <p className="text-sm text-gray-400">
                  Authentication provider via OAuth 2.0 / OpenID Connect. We
                  only use Twitch for identity verification.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Anonymous Viewers">
            <p className="text-sm text-gray-400 leading-relaxed">
              Viewers can vote without signing in. Anonymous votes use a locally
              generated UUID stored in your browser&apos;s localStorage. No
              personal information is collected from anonymous voters. If you
              later sign in with Twitch, your anonymous votes remain separate.
            </p>
          </Section>

          <Section title="Data Retention">
            <p className="text-sm text-gray-400 leading-relaxed">
              Session data (items, votes, placements) is retained for as long as
              the session exists. Creators can delete their sessions at any time,
              which removes all associated data. User accounts can be deleted
              upon request.
            </p>
          </Section>
        </div>
      </main>
      <Footer variant="dark" />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-wider text-white mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ListItem({
  positive,
  negative,
  children,
}: {
  positive?: boolean;
  negative?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-400">
      {positive && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {negative && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400 shrink-0 mt-0.5">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
      <span>{children}</span>
    </li>
  );
}
