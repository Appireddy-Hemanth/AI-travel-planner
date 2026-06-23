'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createTrip } from '@/lib/api';
import { BudgetTier, INTEREST_OPTIONS } from '@/lib/types';

type WizardStep = 'destination' | 'details' | 'interests' | 'generating';

const INTEREST_EMOJIS: Record<string, string> = {
  'Adventure': '🧗',
  'Culture': '🎭',
  'Food & Cuisine': '🍜',
  'History': '🏛️',
  'Nature': '🌲',
  'Nightlife': '🍹',
  'Photography': '📸',
  'Relaxation': '🧘',
  'Shopping': '🛍️',
  'Sports': '⚽',
  'Art & Museums': '🖼️',
  'Architecture': '🏢',
  'Beach': '🏖️',
  'Wildlife': '🦁',
  'Local Experiences': '🗺️',
};

const POPULAR_DESTINATIONS = [
  { name: 'Tokyo, Japan', emoji: '🌸' },
  { name: 'Paris, France', emoji: '🗼' },
  { name: 'Bali, Indonesia', emoji: '🌴' },
  { name: 'New York, USA', emoji: '🗽' },
  { name: 'Rome, Italy', emoji: '🏛️' },
];

export default function NewTripPage() {
  const [step, setStep] = useState<WizardStep>('destination');
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const router = useRouter();

  const loadingTexts = [
    '📍 Pinpointing destination coordinates...',
    '🕵️ Scouting local landmarks & hidden gems...',
    '🏨 Sifting through top-rated accommodations...',
    '🍽️ Curating local dining & culinary hot spots...',
    '🚇 Optimizing transit routes and timing...',
    '🎒 Personalizing your smart packing checklist...',
    '✨ Assembling the final detailed itinerary...',
  ];

  // Rotating loading texts & progress percentage simulation
  useEffect(() => {
    if (step !== 'generating') {
      setProgress(0);
      setLoadingTextIndex(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        const increment = prev < 50 ? 6 : prev < 80 ? 3 : 0.8;
        return Math.min(prev + increment, 98);
      });
    }, 450);

    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [step, loadingTexts.length]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setError('');
    setStep('generating');

    try {
      const res = await createTrip({
        destination,
        durationDays,
        budgetTier,
        interests,
      });

      if (res.success && res.data) {
        const trip = res.data as unknown as { _id: string };
        router.push(`/trips/${trip._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate trip');
      setStep('interests');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 'destination') {
      if (destination.trim()) {
        setError('');
        setStep('details');
      }
    } else if (step === 'details') {
      setStep('interests');
    } else if (step === 'interests') {
      handleGenerate(e);
    }
  };

  // Stepper helper
  const steps = [
    { key: 'destination', label: 'Destination', icon: '🌍' },
    { key: 'details', label: 'Trip Details', icon: '📋' },
    { key: 'interests', label: 'Interests', icon: '🎯' },
  ] as const;

  const currentStepIdx = ['destination', 'details', 'interests', 'generating'].indexOf(step);

  // ── Generating State ────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-scale-in">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          {/* Subtle scanning gradient in background */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Radar Scanning Visual */}
          <div className="radar-container mb-8">
            <div className="radar-circle" />
            <div className="radar-scanner" />
            <div className="radar-dot">🤖</div>
          </div>

          <h2 className="text-3xl font-extrabold mb-3 gradient-text">
            AI is crafting your trip...
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Planning <span className="text-foreground font-semibold font-mono">{durationDays} days</span> in <span className="text-foreground font-semibold">{destination}</span> with a <span className="text-foreground font-semibold">{budgetTier === 'Low' ? 'Budget' : budgetTier === 'Medium' ? 'Mid-Range' : 'Luxury'}</span> tier. This takes about 15-30 seconds.
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">CREATING PLAN</span>
              <span className="text-sm font-mono font-bold text-accent">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar h-2.5">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Animated Status Text */}
          <div className="h-10 flex items-center justify-center">
            <p className="text-base text-accent-hover font-medium animate-float font-mono">
              {loadingTexts[loadingTextIndex]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-4 animate-fade-in">
      
      {/* ── Custom Progress Stepper ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10 px-4 relative">
        {/* Background Line */}
        <div className="absolute top-[22px] left-10 right-10 h-0.5 bg-border -z-10" />
        {/* Progress Line */}
        <div 
          className="absolute top-[22px] left-10 h-0.5 bg-success/60 -z-10 transition-all duration-500 ease-out" 
          style={{ width: `${currentStepIdx === 1 ? '38%' : currentStepIdx === 2 ? '80%' : '0%'}` }}
        />

        {steps.map((item, idx) => {
          const isCompleted = currentStepIdx > idx;
          const isActive = step === item.key;
          return (
            <div key={item.key} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`step-node ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
              >
                {isCompleted ? '✓' : item.icon}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-accent' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3.5 mb-6 animate-slide-down flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 1: Destination ──────────────────────────────────────── */}
        {step === 'destination' && (
          <div className="glass-card p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🌍</span>
              <h2 className="text-3xl font-extrabold gradient-text">
                Where is your next adventure?
              </h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Enter any city, country, or region worldwide, and let our AI model curate a completely personalized itinerary.
            </p>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-70 pointer-events-none">🔍</span>
              <input
                id="trip-destination"
                type="text"
                className="input-field text-lg py-4 pl-12"
                placeholder="e.g. Tokyo, Japan or Amalfi Coast, Italy"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Popular Suggestions */}
            <div className="mb-8">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-3">Popular Destinations</span>
              <div className="destination-chips-container">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => setDestination(dest.name)}
                    className={`destination-chip ${destination === dest.name ? 'active' : ''}`}
                  >
                    <span>{dest.emoji}</span> {dest.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="glow-button w-full py-4 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={!destination.trim()}
              onClick={() => setStep('details')}
              id="wizard-next-1"
            >
              Continue Plan
              <span className="text-base">→</span>
            </button>
          </div>
        )}

        {/* ── Step 2: Trip Details ─────────────────────────────────────── */}
        {step === 'details' && (
          <div className="glass-card p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📅</span>
              <h2 className="text-3xl font-extrabold gradient-text">Trip Specifics</h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Define the length of your stay and select your preferred travel budget class.
            </p>

            {/* Duration Slider with Increment/Decrement */}
            <div className="mb-8" style={{ marginBottom: '32px' }}>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="trip-duration"
                  className="text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Duration
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold font-mono text-accent">
                    {durationDays}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">days</span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background/50 border border-border/80 p-4 rounded-2xl mb-2">
                <button
                  type="button"
                  onClick={() => setDurationDays((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-card hover:bg-card-hover border border-border text-foreground font-bold hover:border-border-hover active:scale-95 transition-all"
                >
                  −
                </button>
                
                <input
                  id="trip-duration"
                  type="range"
                  min={1}
                  max={21}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="flex-1 accent-accent cursor-ew-resize h-1.5 rounded-full"
                />

                <button
                  type="button"
                  onClick={() => setDurationDays((prev) => Math.min(21, prev + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-card hover:bg-card-hover border border-border text-foreground font-bold hover:border-border-hover active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">Tip: AI generates optimized custom plans for up to 3 weeks (21 days).</span>
            </div>

            {/* Budget Tier */}
            <div className="mb-8" style={{ marginBottom: '32px' }}>
              <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Budget Tier Class
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(
                  [
                    { tier: 'Low' as const, icon: '💵', label: 'Economy', desc: 'Hostels, local transit & budget eats' },
                    { tier: 'Medium' as const, icon: '💳', label: 'Business', desc: 'Boutique hotels, cabs & dining out' },
                    { tier: 'High' as const, icon: '💎', label: 'First Class', desc: 'Luxury stays, fine dining & private guides' },
                  ] as const
                ).map(({ tier, icon, label, desc }) => {
                  const isActive = budgetTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setBudgetTier(tier)}
                      className={`select-card ${isActive ? 'active' : ''}`}
                      id={`budget-${tier.toLowerCase()}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{icon}</span>
                      </div>
                      <div className="text-base font-bold text-foreground mb-1">{label}</div>
                      <div className="text-xs text-muted-foreground leading-snug">{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4" style={{ marginTop: '32px' }}>
              <button
                type="button"
                onClick={() => setStep('destination')}
                className="flex-1 py-4 rounded-xl text-sm font-medium border border-border hover:bg-card-hover hover:border-border-hover active:scale-98 transition-all"
                id="wizard-back-2"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep('interests')}
                className="flex-1 glow-button py-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                id="wizard-next-2"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Interests ────────────────────────────────────────── */}
        {step === 'interests' && (
          <div className="glass-card p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🎯</span>
              <h2 className="text-3xl font-extrabold gradient-text">
                Your Interests & Vibe
              </h2>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Select what you love. We use these tags to tailor the itinerary activities, hotspots, and recommendations.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6" style={{ marginBottom: '24px' }}>
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = interests.includes(interest);
                const emoji = INTEREST_EMOJIS[interest] || '📍';
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`interest-chip ${isSelected ? 'active' : ''}`}
                    id={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="text-base">{emoji}</span>
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-6" style={{ marginBottom: '24px' }}>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selections</span>
              {interests.length > 0 ? (
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-accent/25 text-accent-hover border border-accent/20">
                  {interests.length} / {INTEREST_OPTIONS.length} SELECTED
                </span>
              ) : (
                <span className="text-xs text-danger font-semibold">Please select at least one interest</span>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-4 rounded-xl text-sm font-medium border border-border hover:bg-card-hover hover:border-border-hover active:scale-98 transition-all"
                id="wizard-back-3"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="flex-1 glow-button py-4 text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={interests.length === 0}
                id="wizard-generate"
              >
                ✨ Generate Custom Itinerary
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ── Boarding Pass Summary Card (Step 2 and Step 3) ──────────────── */}
      {step !== 'destination' && (
        <div className="mt-8 ticket-card p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">AI TRAVEL SYSTEM</span>
              <h4 className="font-extrabold text-accent text-sm tracking-wider">BOARDING TICKET</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-mono">PLANNER ID</span>
              <span className="font-mono font-bold text-success text-sm">TRIP-{durationDays}D</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">DESTINATION</span>
              <span className="font-bold text-foreground truncate block">{destination || '---'}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">DURATION</span>
              <span className="font-bold text-foreground font-mono block">0{durationDays} DAYS</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">BUDGET CLASS</span>
              <span className="font-bold text-foreground block">
                {budgetTier === 'Low' ? 'ECONOMY' : budgetTier === 'Medium' ? 'BUSINESS' : 'FIRST CLASS'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold">PLAN DATE</span>
              <span className="font-bold text-foreground font-mono block">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="ticket-divider" />

          {/* Interests in Ticket */}
          {step === 'interests' && interests.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] text-muted-foreground block uppercase font-semibold mb-1.5">Selected Vibes</span>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest) => (
                  <span key={interest} className="px-2 py-0.5 rounded-md bg-accent-glow text-[10px] text-accent-hover font-semibold">
                    {INTEREST_EMOJIS[interest]} {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>STATUS:</span>
              <span className="px-2 py-0.5 rounded-md bg-accent-glow text-accent font-semibold uppercase tracking-wider font-mono">
                {step === 'details' ? 'SELECTING DETAILS' : 'CHOOSING INTERESTS'}
              </span>
            </div>
            <div className="font-mono tracking-wider">
              ★ POWERED BY GEMINI 2.5 FLASH ★
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
