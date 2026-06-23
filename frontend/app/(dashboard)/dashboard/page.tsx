'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTrips, deleteTrip } from '@/lib/api';
import { ITrip } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  const fetchTrips = async () => {
    try {
      const res = await getTrips();
      if (res.success && res.data) {
        setTrips(res.data as unknown as ITrip[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip plan?')) return;
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t._id !== tripId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete trip');
    }
  };

  const handleBookmark = (tripId: string) => {
    setBookmarked((prev) => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const totalDays = trips.reduce((sum, t) => sum + t.durationDays, 0);
  const uniqueDestinations = new Set(
    trips.map((t) => t.destination.split(',')[1]?.trim() || t.destination.split(',')[0].trim())
  ).size;
  const totalBudget = trips.reduce((sum, t) => sum + (t.estimatedBudget?.total || 0), 0);
  const budgetSaved = Math.round(totalBudget * 0.12);

  const getDestinationImage = (dest: string) => {
    const lower = dest.toLowerCase();
    if (lower.includes('tokyo') || lower.includes('japan')) {
      return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80';
    }
    if (lower.includes('paris') || lower.includes('france')) {
      return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80';
    }
    if (lower.includes('rome') || lower.includes('italy')) {
      return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80';
    }
    if (lower.includes('new york') || lower.includes('nyc') || lower.includes('usa')) {
      return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80';
    }
    if (lower.includes('london') || lower.includes('uk') || lower.includes('england')) {
      return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80';
    }
    if (lower.includes('bali') || lower.includes('indonesia')) {
      return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="skeleton h-10 w-64 mb-3" />
            <div className="skeleton h-6 w-96" />
          </div>
          <div className="skeleton h-14 w-48 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton h-[480px] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 animate-fade-in">
      {/* ── Greeting Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Hi, {user?.name || 'Hemanth'} 👋
          </h1>
          <p className="text-muted-foreground text-base">
            {trips.length === 0
              ? 'Ready for your next adventure? Start by planning a trip.'
              : `Ready for your next adventure? You have ${trips.length} premium itinerary plan${
                  trips.length !== 1 ? 's' : ''
                } ready.`}
          </p>
        </div>
        <Link
          href="/trips/new"
          className="glow-button flex items-center gap-2 hover:scale-102 transition-all active:scale-98"
          id="dashboard-new-trip"
        >
          <span>✨</span>
          Plan New Adventure
        </Link>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3.5 mb-6 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Travel Statistics Dashboard ─────────────────────────────────── */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Total Trips */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-accent/30 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Total Trips
                </span>
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {trips.length}
                </span>
              </div>
              <span className="text-3xl p-3 rounded-2xl bg-accent-glow text-accent group-hover:scale-110 transition-transform">
                🗺️
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-success font-semibold">Active Concierge</span>
              <svg className="w-16 h-8 text-accent" viewBox="0 0 100 30">
                <path
                  d="M0,25 Q15,5 30,20 T60,10 T90,5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Countries Explored */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-success/30 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Countries Explored
                </span>
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {uniqueDestinations}
                </span>
              </div>
              <span className="text-3xl p-3 rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform">
                🌍
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-success font-semibold">Global Footprint</span>
              <svg className="w-16 h-8 text-success" viewBox="0 0 100 30">
                <path
                  d="M0,20 Q20,10 40,25 T80,12 T100,5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Total Days Planned */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-warning/30 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Total Days
                </span>
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  {totalDays}
                </span>
              </div>
              <span className="text-3xl p-3 rounded-2xl bg-warning/10 text-warning group-hover:scale-110 transition-transform">
                📅
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-success font-semibold">Adventure Time</span>
              <svg className="w-16 h-8 text-warning" viewBox="0 0 100 30">
                <path
                  d="M0,15 Q30,5 60,25 T100,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Budget Saved */}
          <div className="glass-card p-6 flex flex-col justify-between hover:border-pink/30 transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Budget Saved
                </span>
                <span className="text-3xl font-extrabold font-mono text-foreground">
                  ${budgetSaved.toLocaleString()}
                </span>
              </div>
              <span className="text-3xl p-3 rounded-2xl bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform">
                💵
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-success font-semibold">Saved vs Estimate</span>
              <svg className="w-16 h-8 text-pink-500" viewBox="0 0 100 30">
                <path
                  d="M0,28 L20,22 L40,15 L60,8 L80,12 L100,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────────────── */}
      {trips.length === 0 && !error && (
        <div className="glass-card p-16 text-center max-w-3xl mx-auto mt-10">
          <div className="text-7xl mb-6 animate-float">✈️</div>
          <h2 className="text-3xl font-extrabold mb-4 gradient-text">
            Start Your Journey
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed text-base">
            Let our AI-powered planner build the perfect itinerary, list the best hotel tiers, calculate budgets, and formulate a customized packing list.
          </p>
          <Link
            href="/trips/new"
            className="glow-button inline-flex items-center gap-2 px-8 py-4 text-base rounded-xl"
            id="empty-state-cta"
          >
            <span>✨</span>
            Create Your First Plan
          </Link>
        </div>
      )}

      {/* ── Trip Cards Grid ────────────────────────────────────────────── */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <div key={trip._id} className="airbnb-trip-card">
              {/* Top Image area */}
              <div className="airbnb-trip-card-image-container">
                <img
                  src={getDestinationImage(trip.destination)}
                  alt={trip.destination}
                  className="airbnb-trip-card-image"
                />
                <div className="airbnb-trip-card-overlay" />
                <button
                  onClick={() => handleBookmark(trip._id)}
                  className="airbnb-trip-card-bookmark"
                  title="Bookmark"
                >
                  {bookmarked[trip._id] ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Card Content area */}
              <div className="airbnb-trip-card-content">
                <div>
                  <h3 className="text-2xl font-bold text-foreground truncate mb-1">
                    {trip.destination.split(',')[0]}
                  </h3>
                  <span className="text-sm text-muted-foreground block mb-3">
                    📍 {trip.destination.split(',').slice(1).join(', ') || 'Explore Details'}
                  </span>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 border border-white/5 text-muted-foreground flex items-center gap-1">
                      📅 {trip.durationDays} Days
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border border-white/5 bg-white/5 text-muted-foreground flex items-center gap-1`}>
                      💼 {trip.budgetTier === 'Low' ? 'Economy' : trip.budgetTier === 'Medium' ? 'Business' : 'First Class'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {trip.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                        className="badge badge-accent text-[9px] font-bold tracking-wider"
                      >
                        {interest}
                      </span>
                    ))}
                    {trip.interests.length > 3 && (
                      <span className="badge badge-accent text-[9px] font-bold font-mono">
                        +{trip.interests.length - 3} MORE
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">Estimated Budget</span>
                    <span className="font-extrabold font-mono text-xl text-success">
                      ${trip.estimatedBudget?.total > 0 ? trip.estimatedBudget.total.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/trips/${trip._id}`}
                      className="glow-button px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center"
                      style={{ height: '40px !important' }}
                      id={`trip-view-${trip._id}`}
                    >
                      Explore
                    </Link>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-danger/10 hover:text-danger flex items-center justify-center text-sm transition-all border border-white/5"
                      title="Delete Trip"
                      id={`trip-delete-${trip._id}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
