'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { getPublicTrip } from '@/lib/api';
import { ITrip } from '@/lib/types';

type Tab = 'itinerary' | 'hotels' | 'budget' | 'packing';

export default function PublicTripSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [error, setError] = useState('');

  const fetchTrip = useCallback(async () => {
    try {
      const res = await getPublicTrip(id);
      if (res.success && res.data) {
        setTrip(res.data as unknown as ITrip);
      } else {
        setError(res.error || 'Failed to load shared trip');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared trip');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="skeleton h-[320px] rounded-[32px] mb-8" />
        <div className="skeleton h-14 rounded-2xl mb-8" />
        <div className="space-y-6">
          <div className="skeleton h-48 rounded-3xl" />
          <div className="skeleton h-48 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20 px-6">
        <div className="text-6xl mb-6">😕</div>
        <h2 className="text-3xl font-extrabold mb-3">Shared Trip Not Found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">{error}</p>
        <Link href="/" className="glow-button px-8 py-4 rounded-xl">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'itinerary', label: 'Itinerary', icon: '🗓️' },
    { key: 'hotels', label: 'Hotels', icon: '🏨' },
    { key: 'budget', label: 'Budget', icon: '💰' },
    { key: 'packing', label: 'Packing', icon: '🎒' },
  ];

  // Expenses calculations
  const actualByCategory = {
    flights: 0,
    buses: 0,
    trains: 0,
    carRentals: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    other: 0,
  };
  const expensesList = trip.expenses || [];
  expensesList.forEach((exp) => {
    const cat = exp.category.toLowerCase().trim();
    if (cat === 'flights') actualByCategory.flights += exp.amount;
    else if (cat === 'buses') actualByCategory.buses += exp.amount;
    else if (cat === 'trains') actualByCategory.trains += exp.amount;
    else if (cat === 'car rentals' || cat === 'carrentals' || cat === 'car rental')
      actualByCategory.carRentals += exp.amount;
    else if (cat === 'accommodation') actualByCategory.accommodation += exp.amount;
    else if (cat === 'food') actualByCategory.food += exp.amount;
    else if (cat === 'activities') actualByCategory.activities += exp.amount;
    else actualByCategory.other += exp.amount;
  });
  const totalActual = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
  const totalEstimated = trip.estimatedBudget.total;

  const getStatus = (est: number, act: number) => {
    if (est === 0) {
      return act > 0
        ? { text: '⚠️ Over Budget', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }
        : {
            text: '✓ No Spend',
            bg: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.6)',
          };
    }
    if (act > est) {
      return { text: '⚠️ Over Budget', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
    }
    if (act >= est * 0.85) {
      return { text: '⚡ Near Budget', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
    }
    return { text: '✓ Under Budget', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
  };

  const totalItems = trip.packingList.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedItems = trip.packingList.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.packed).length,
    0
  );
  const packingPercent = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const getDestinationImage = (dest: string) => {
    const lower = dest.toLowerCase();
    if (lower.includes('tokyo') || lower.includes('japan')) {
      return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('paris') || lower.includes('france')) {
      return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('rome') || lower.includes('italy')) {
      return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('new york') || lower.includes('nyc') || lower.includes('usa')) {
      return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('london') || lower.includes('uk') || lower.includes('england')) {
      return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80';
    }
    if (lower.includes('bali') || lower.includes('indonesia')) {
      return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80';
    }
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  };

  const getHotelImage = (tier: string, index: number) => {
    const urls = {
      Budget: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
      ],
      'Mid-Range': [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80',
      ],
      Luxury: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80',
      ],
    };
    const tierList = urls[tier as keyof typeof urls] || urls.Budget;
    return tierList[index % tierList.length];
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 animate-fade-in">
      {/* ── Print-only container ── */}
      <div className="hidden print:block print:p-8 print:text-black">
        <h1 className="text-3xl font-bold mb-2">{trip.destination} Itinerary</h1>
        <p className="text-sm mb-6 text-gray-600">
          Duration: {trip.durationDays} days | Budget Tier: {trip.budgetTier}
        </p>

        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Itinerary Details</h2>
          {trip.itinerary.map((day) => (
            <div key={day.dayNumber} className="mb-4 break-inside-avoid">
              <h3 className="font-semibold text-lg">Day {day.dayNumber}</h3>
              <div className="pl-4 space-y-2 mt-2">
                {day.activities.map((act, i) => (
                  <div key={i} className="text-sm">
                    <strong>
                      {act.timeOfDay}: {act.title}
                    </strong>
                    <p className="text-gray-700">{act.description}</p>
                    {act.estimatedCost > 0 && (
                      <span className="text-xs text-gray-500">
                        Est. Cost: ${act.estimatedCost}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 break-inside-avoid">
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Recommended Hotels</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm">
                <th className="py-2">Hotel</th>
                <th className="py-2">Tier</th>
                <th className="py-2">Rating</th>
                <th className="py-2">Price per Night</th>
              </tr>
            </thead>
            <tbody>
              {trip.hotels.map((h, i) => (
                <tr key={i} className="border-b text-sm">
                  <td className="py-2">{h.name}</td>
                  <td className="py-2">{h.tier}</td>
                  <td className="py-2">{h.rating}</td>
                  <td className="py-2">${h.pricePerNight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 break-inside-avoid">
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Estimated Budget</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              Flights: <strong>${trip.estimatedBudget.flights || 0}</strong>
            </div>
            <div>
              Buses: <strong>${trip.estimatedBudget.buses || 0}</strong>
            </div>
            <div>
              Trains: <strong>${trip.estimatedBudget.trains || 0}</strong>
            </div>
            <div>
              Car Rentals: <strong>${trip.estimatedBudget.carRentals || 0}</strong>
            </div>
            <div>
              Accommodation: <strong>${trip.estimatedBudget.accommodation || 0}</strong>
            </div>
            <div>
              Food: <strong>${trip.estimatedBudget.food || 0}</strong>
            </div>
            <div>
              Activities: <strong>${trip.estimatedBudget.activities || 0}</strong>
            </div>
            <div className="col-span-2 border-t pt-2 mt-2 font-bold">
              Total: ${trip.estimatedBudget.total || 0}
            </div>
          </div>
        </div>
      </div>

      {/* ── Screen UI container ── */}
      <div className="print:hidden">
        {/* ── Destination Cover Hero Banner ───────────────────────────────── */}
        <div className="relative h-[320px] rounded-[32px] overflow-hidden mb-10 shadow-2xl group animate-scale-in">
          <img
            src={getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/30 border border-accent/20 text-white mb-3">
                🔗 Shared Trip Invitation (Read-Only)
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mt-1">
                {trip.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-1">
                  📅 {trip.durationDays} Days
                </span>
                <span className="px-3 py-1 rounded-xl bg-accent/20 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                  {trip.budgetTier === 'Low'
                    ? 'Economy'
                    : trip.budgetTier === 'Medium'
                    ? 'Business'
                    : 'First Class'}
                </span>
                {trip.weatherInsights && (
                  <span className="px-3 py-1 rounded-xl bg-success/20 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1">
                    🌤️ {trip.weatherInsights.condition}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => window.print()}
                className="glow-button-secondary h-12 text-sm rounded-xl"
                id="print-itinerary"
              >
                🖨️ Export PDF
              </button>
              <Link href="/" className="glow-button h-12 text-sm rounded-xl" id="nav-home">
                Build Your Own Trip ✨
              </Link>
            </div>
          </div>
        </div>

        {/* ── Weather Insights ────────────────────────────────────────────── */}
        {trip.weatherInsights && (
          <div className="mb-10 animate-scale-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              🌦️ Weather & Climate Insights
            </h2>
            <div className="weather-widget-grid">
              {/* Temperature Card */}
              <div className="weather-card-apple">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Average Temperature
                  </span>
                  <span className="text-3xl">🌡️</span>
                </div>
                <div className="my-4">
                  <span className="text-4xl font-extrabold font-mono text-white block">
                    {trip.weatherInsights.averageTemp}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    Typical for travel dates
                  </span>
                </div>
              </div>

              {/* Condition Card */}
              <div className="weather-card-apple">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Condition
                  </span>
                  <span className="text-3xl">
                    {trip.weatherInsights.condition.toLowerCase().includes('sun') ||
                    trip.weatherInsights.condition.toLowerCase().includes('clear')
                      ? '☀️'
                      : trip.weatherInsights.condition.toLowerCase().includes('rain') ||
                        trip.weatherInsights.condition.toLowerCase().includes('showers')
                      ? '🌧️'
                      : trip.weatherInsights.condition.toLowerCase().includes('cloud') ||
                        trip.weatherInsights.condition.toLowerCase().includes('overcast')
                      ? '☁️'
                      : '🌤️'}
                  </span>
                </div>
                <div className="my-4">
                  <span className="text-2xl font-bold text-white block capitalize">
                    {trip.weatherInsights.condition}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {trip.weatherInsights.packingAdvice}
                  </span>
                </div>
              </div>

              {/* Seasonal Highlights Card */}
              <div className="weather-card-apple justify-start gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    🌟 Seasonal Highlights
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {trip.weatherInsights.seasonalHighlights}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tabs Header ─────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/5 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
              id={`tab-${tab.key}`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.key === 'packing' && totalItems > 0 && (
                <span className="text-xs ml-1 font-mono px-2 py-0.5 rounded bg-white/5 opacity-70">
                  {packedItems}/{totalItems}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}

        {/* ITINERARY TAB */}
        <div className={activeTab === 'itinerary' ? 'block' : 'hidden print:block'}>
          <div className="space-y-8">
            {trip.itinerary.map((day) => (
              <div key={day.dayNumber} className="glass-card animate-fade-in">
                <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                  <h3 className="text-2xl font-black text-white">Day {day.dayNumber}</h3>
                </div>

                <div className="timeline-container space-y-6">
                  {day.activities.map((activity, aIdx) => (
                    <div key={aIdx} className="timeline-node">
                      <div className="activity-card-timeline flex gap-6">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <span className="w-10 h-10 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-lg shadow-sm">
                            {activity.timeOfDay === 'Morning'
                              ? '🌅'
                              : activity.timeOfDay === 'Afternoon'
                              ? '☀️'
                              : '🌙'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <h4 className="font-bold text-lg text-foreground truncate">
                              {activity.title}
                            </h4>
                            {activity.estimatedCost > 0 && (
                              <span className="font-mono font-bold text-success text-sm bg-success/10 border border-success/10 px-2.5 py-0.5 rounded-lg">
                                ${activity.estimatedCost}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-accent font-semibold uppercase tracking-wider block mb-3">
                            {activity.timeOfDay}
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOTELS TAB */}
        <div className={`print-section-break ${activeTab === 'hotels' ? 'block' : 'hidden print:block'}`}>
          <h2 className="hidden print:block text-2xl font-bold mb-6">🏨 Recommended Accommodations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {trip.hotels.map((hotel, idx) => (
              <div key={idx} className="hotel-card">
                <div
                  className="hotel-card-image h-[200px]"
                  style={{
                    backgroundImage: `url(${getHotelImage(hotel.tier, idx)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <span
                    className={`badge text-xs absolute top-4 left-4 z-10 ${
                      hotel.tier === 'Budget'
                        ? 'badge-success'
                        : hotel.tier === 'Mid-Range'
                        ? 'badge-accent'
                        : 'badge-warning'
                    }`}
                  >
                    {hotel.tier === 'Budget' ? '💵' : hotel.tier === 'Mid-Range' ? '💳' : '💎'}{' '}
                    {hotel.tier}
                  </span>
                </div>

                <div className="hotel-card-content p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="hotel-card-title text-xl font-bold mb-1">{hotel.name}</h3>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-warning">⭐</span>
                      <span className="text-white font-semibold">{hotel.rating}</span>
                      <span className="text-white/20">•</span>
                      <span className="hotel-card-location">📍 Central {trip.destination.split(',')[0]}</span>
                    </div>

                    <p className="hotel-card-description text-sm text-muted-foreground leading-relaxed mb-4">
                      {hotel.description}
                    </p>

                    <div className="hotel-card-amenities flex flex-wrap gap-1.5 mb-6">
                      {hotel.tier === 'Budget' ? (
                        <>
                          <span className="hotel-card-amenity">📶 WiFi</span>
                          <span className="hotel-card-amenity">🍳 Breakfast</span>
                          <span className="hotel-card-amenity">🧼 Laundry</span>
                        </>
                      ) : hotel.tier === 'Mid-Range' ? (
                        <>
                          <span className="hotel-card-amenity">📶 Free WiFi</span>
                          <span className="hotel-card-amenity">🏊 Pool</span>
                          <span className="hotel-card-amenity">🍽️ Restaurant</span>
                        </>
                      ) : (
                        <>
                          <span className="hotel-card-amenity">🏊 Infinity Pool</span>
                          <span className="hotel-card-amenity">💆 Luxury Spa</span>
                          <span className="hotel-card-amenity">🛎️ Butler</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="hotel-card-footer pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div>
                      <span className="hotel-card-price-label text-xs text-muted-foreground block">
                        Price per night
                      </span>
                      <span className="hotel-card-price text-2xl font-extrabold text-success">
                        ${hotel.pricePerNight}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="hotel-card-book-btn px-4 py-2.5 rounded-xl text-xs font-bold"
                      onClick={() => alert(`Redirecting to check availability at ${hotel.name}...`)}
                    >
                      Book Room
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BUDGET TAB */}
        {trip.estimatedBudget && (
          <div className={`print-section-break ${activeTab === 'budget' ? 'block' : 'hidden print:block'}`}>
            <h2 className="hidden print:block text-2xl font-bold mb-6">📊 Budget & Expense Tracking</h2>
            <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Estimated Budget Cards */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Estimated Budget Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Flights', value: trip.estimatedBudget.flights || 0, icon: '✈️', color: 'text-accent' },
                    { label: 'Buses', value: trip.estimatedBudget.buses || 0, icon: '🚌', color: 'text-accent/80' },
                    { label: 'Trains', value: trip.estimatedBudget.trains || 0, icon: '🚇', color: 'text-accent/60' },
                    { label: 'Car Rentals', value: trip.estimatedBudget.carRentals || 0, icon: '🚗', color: 'text-accent/40' },
                    { label: 'Accommodation', value: trip.estimatedBudget.accommodation || 0, icon: '🏨', color: 'text-success' },
                    { label: 'Food', value: trip.estimatedBudget.food || 0, icon: '🍽️', color: 'text-warning' },
                    { label: 'Activities', value: trip.estimatedBudget.activities || 0, icon: '🎯', color: 'text-gradient-end' },
                  ].map((item) => {
                    const pct =
                      trip.estimatedBudget.total > 0
                        ? (item.value / trip.estimatedBudget.total) * 100
                        : 0;
                    return (
                      <div
                        key={item.label}
                        className="glass-card h-[110px] p-6 flex flex-col justify-between hover:scale-[1.02] active:scale-[1.01] transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-sm font-semibold text-muted-foreground">
                              {item.label}
                            </span>
                          </div>
                          <span className={`font-mono font-bold text-lg ${item.color}`}>
                            ${item.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground text-sm mb-2">Estimated Total</p>
                  <p className="text-5xl font-extrabold font-mono gradient-text mb-4">
                    ${trip.estimatedBudget.total.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    For {trip.durationDays} days in {trip.destination}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <div className="px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
                      <span className="text-xs text-muted-foreground">Per Day: </span>
                      <span className="font-mono font-semibold text-accent">
                        ${Math.round(trip.estimatedBudget.total / trip.durationDays).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparative spending visuals */}
              <div className="space-y-6">
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    📊 Estimate vs. Actual Spending
                  </h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Flights', est: trip.estimatedBudget.flights || 0, act: actualByCategory.flights },
                      { label: 'Buses', est: trip.estimatedBudget.buses || 0, act: actualByCategory.buses },
                      { label: 'Trains', est: trip.estimatedBudget.trains || 0, act: actualByCategory.trains },
                      { label: 'Car Rentals', est: trip.estimatedBudget.carRentals || 0, act: actualByCategory.carRentals },
                      { label: 'Accommodation', est: trip.estimatedBudget.accommodation || 0, act: actualByCategory.accommodation },
                      { label: 'Food', est: trip.estimatedBudget.food || 0, act: actualByCategory.food },
                      { label: 'Activities', est: trip.estimatedBudget.activities || 0, act: actualByCategory.activities },
                      { label: 'Other', est: 0, act: actualByCategory.other },
                    ].map((cat) => {
                      const maxVal = Math.max(cat.est, cat.act, 1);
                      const estPct = cat.est > 0 ? (cat.est / maxVal) * 100 : 0;
                      const actPct = cat.act > 0 ? (cat.act / maxVal) * 100 : 0;
                      const isOver = cat.est > 0 && cat.act > cat.est;

                      const status = getStatus(cat.est, cat.act);
                      return (
                        <div
                          key={cat.label}
                          className="glass-card min-h-[90px] p-6 flex flex-col gap-3 hover:scale-[1.01] transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-foreground">
                                {cat.label}
                              </span>
                              <div className="flex items-center gap-3 text-sm font-mono">
                                <span className="text-muted-foreground">
                                  Est: <strong className="text-foreground">${cat.est}</strong>
                                </span>
                                <span className="text-muted-foreground">|</span>
                                <span className="text-muted-foreground">
                                  Act: <strong className="text-foreground">${cat.act}</strong>
                                </span>
                              </div>
                            </div>
                            <span
                              className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                              style={{ backgroundColor: status.bg, color: status.color }}
                            >
                              {status.text}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {cat.est > 0 && (
                              <div
                                className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"
                                title="Estimate Progress"
                              >
                                <div className="h-full bg-white/20 rounded-full" style={{ width: `${estPct}%` }} />
                              </div>
                            )}
                            <div
                              className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"
                              title="Actual Progress"
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${actPct}%`,
                                  backgroundColor: status.color,
                                  boxShadow: isOver ? `0 0 8px ${status.color}` : 'none',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-xl">
                      <div>
                        <h4 className="font-bold text-base">Total Spending Summary</h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          Estimate: ${totalEstimated.toLocaleString()} | Actual: $
                          {totalActual.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl font-bold font-mono ${
                            totalActual > totalEstimated ? 'text-danger' : 'text-success'
                          }`}
                        >
                          ${totalActual.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totalActual > totalEstimated
                            ? `(${(totalActual - totalEstimated).toLocaleString()} over)`
                            : `(${(totalEstimated - totalActual).toLocaleString()} remaining)`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List of expenses */}
                {expensesList.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4">Actual Expenses List</h3>
                    <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-2">
                      {expensesList.map((exp, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-sm"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {exp.description || 'Expense'}
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                              <span className="capitalize text-accent-hover font-semibold">
                                {exp.category}
                              </span>
                              <span>•</span>
                              <span>{new Date(exp.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="font-mono font-bold text-success">${exp.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* PACKING */}
        <div className={`print-section-break ${activeTab === 'packing' ? 'block' : 'hidden print:block'}`}>
          <h2 className="hidden print:block text-2xl font-bold mb-6">🎒 Packing Checklist</h2>
          <div className="space-y-8 animate-fade-in">
            {/* Progress Circular Radial Ring card */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="progress-ring-container flex-shrink-0">
                  <svg className="w-[120px] h-[120px]">
                    <circle
                      className="text-white/5"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="48"
                      cx="60"
                      cy="60"
                    />
                    <circle
                      className="text-accent progress-ring-circle"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - packingPercent / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="48"
                      cx="60"
                      cy="60"
                    />
                  </svg>
                  <span className="absolute text-xl font-extrabold text-white font-mono">
                    {Math.round(packingPercent)}%
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Smart Packing List</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {packingPercent === 100
                      ? '🎉 Spectacular! Every single recommended item has been securely packed.'
                      : `You have completed ${packedItems} out of ${totalItems} recommended travel gear items.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trip.packingList.map((category, catIdx) => {
                const catPacked = category.items.filter((i) => i.packed).length;
                return (
                  <div key={catIdx} className="glass-card flex flex-col h-full">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                      <h3 className="font-bold text-lg text-white">{category.category}</h3>
                      <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">
                        {catPacked}/{category.items.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {category.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent"
                        >
                          <input
                            type="checkbox"
                            checked={item.packed}
                            disabled
                            className="w-5 h-5 rounded accent-accent opacity-50 cursor-not-allowed"
                          />
                          <span
                            className={`text-sm transition-all ${
                              item.packed
                                ? 'line-through text-white/35 font-medium'
                                : 'text-foreground font-medium'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      ))}
                      {category.items.length === 0 && (
                        <p className="text-xs text-muted-foreground italic py-2">No items listed.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
