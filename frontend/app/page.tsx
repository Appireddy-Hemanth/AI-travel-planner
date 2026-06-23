'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold gradient-text">Travelix</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="glow-button px-6 py-2.5 text-sm rounded-xl"
                id="nav-dashboard"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  id="nav-login"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="glow-button px-6 py-2.5 text-sm rounded-xl"
                  id="nav-register"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-end/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-mid/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge badge-accent mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              Powered by AI
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 animate-slide-up">
              Plan Your Dream Trip
              <br />
              <span className="gradient-text">with AI Intelligence</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100 leading-relaxed">
              Generate personalized day-by-day itineraries, smart hotel
              recommendations, and AI-curated packing lists — all in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
              <Link
                href="/register"
                className="glow-button px-8 py-4 text-lg rounded-xl w-full sm:w-auto text-center"
                id="hero-cta-primary"
              >
                Start Planning — It&apos;s Free
              </Link>
              <Link
                href="/login"
                className="glow-button-secondary px-8 py-4 text-lg rounded-xl w-full sm:w-auto text-center"
                id="hero-cta-secondary"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section className="py-24 px-6" id="features-section">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need for the
                <span className="gradient-text"> Perfect Trip</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our AI analyzes your preferences, budget, and interests to craft
                a trip that&apos;s uniquely yours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="glass-card p-8 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it Works ──────────────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-16">
              Three Steps to Your
              <span className="gradient-text"> Dream Vacation</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl font-bold text-accent mb-6">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-border py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✈️</span>
              <span className="font-semibold gradient-text">Travelix</span>
            </div>
            <p className="text-sm text-muted">
              © {new Date().getFullYear()} Travelix. AI-Powered Travel Planning.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

const features = [
  {
    icon: '🗓️',
    title: 'AI Itineraries',
    description:
      'Get detailed day-by-day plans with activities, timings, and cost estimates tailored to your interests.',
  },
  {
    icon: '🏨',
    title: 'Smart Hotel Picks',
    description:
      'AI-curated hotel recommendations across Budget, Mid-Range, and Luxury tiers with real pricing.',
  },
  {
    icon: '💰',
    title: 'Budget Breakdown',
    description:
      'Comprehensive cost estimation covering flights, accommodation, food, and activities.',
  },
  {
    icon: '🎒',
    title: 'Smart Packing Lists',
    description:
      'Destination-aware packing suggestions based on climate, duration, and your planned activities.',
  },
  {
    icon: '✏️',
    title: 'Editable Plans',
    description:
      'Regenerate any day with custom instructions. Add or remove days dynamically with AI assistance.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description:
      'Your trips are yours alone. JWT-based authentication with complete data isolation between users.',
  },
];

const steps = [
  {
    title: 'Enter Details',
    description:
      'Tell us your destination, trip duration, budget tier, and personal interests.',
  },
  {
    title: 'AI Generates',
    description:
      'Our AI creates a complete itinerary, suggests hotels, estimates budget, and packs your bags.',
  },
  {
    title: 'Customize & Go',
    description:
      'Edit any day, regenerate with new instructions, and check off your packing list.',
  },
];
