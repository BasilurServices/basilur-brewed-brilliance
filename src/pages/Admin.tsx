import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, BarChart3, Users, TrendingUp, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MapChart from "@/components/MapChart";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Review {
  id: string;
  batch_id: string;
  qr_id?: string;
  rating: number;
  recommended: boolean;
  created_at: string;
  ip_address?: string;
  location_city?: string;
  location_region?: string;
  location_country?: string;
}

interface BatchStats {
  batch_id: string;
  totalReviews: number;
  avgRating: number;
  recommendedCount: number;
  ratingDist: Record<number, number>;
}

interface QRStats {
  qr_id: string;
  totalReviews: number;
  avgRating: number;
  recommendedCount: number;
  ratingDist: Record<number, number>;
}

const StarDisplay = ({ value, max = 5 }: { value: number; max?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
        }`}
      />
    ))}
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-sm hover:bg-accent/5 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-amber-400" strokeWidth={1.8} />
      </div>
      <span className="text-xs tracking-widest uppercase text-muted-foreground font-medium">{label}</span>
    </div>
    <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </motion.div>
);

const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-muted-foreground w-4 text-right">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
        />
      </div>
      <span className="text-muted-foreground w-5 text-right">{count}</span>
    </div>
  );
};

const Admin = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setReviews(data || []);
      }
      setLoading(false);
    };
    fetchReviews();
  }, []);

  // Derived stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews : 0;
  const recommendedCount = reviews.filter((r) => r.recommended).length;
  const recommendedPct =
    totalReviews > 0 ? Math.round((recommendedCount / totalReviews) * 100) : 0;

  const globalRatingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    globalRatingDist[r.rating] = (globalRatingDist[r.rating] || 0) + 1;
  });

  // Per-batch stats
  const batchMap: Record<string, BatchStats> = {};
  reviews.forEach((r) => {
    if (!batchMap[r.batch_id]) {
      batchMap[r.batch_id] = {
        batch_id: r.batch_id,
        totalReviews: 0,
        avgRating: 0,
        recommendedCount: 0,
        ratingDist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
    const b = batchMap[r.batch_id];
    b.totalReviews++;
    b.avgRating += r.rating;
    if (r.recommended) b.recommendedCount++;
    b.ratingDist[r.rating] = (b.ratingDist[r.rating] || 0) + 1;
  });
  const batches = Object.values(batchMap).map((b) => ({
    ...b,
    avgRating: b.totalReviews > 0 ? b.avgRating / b.totalReviews : 0,
  }));

  // Per-QR stats
  const qrMap: Record<string, QRStats> = {};
  reviews.forEach((r) => {
    const qid = r.qr_id || "1";
    if (!qrMap[qid]) {
      qrMap[qid] = {
        qr_id: qid,
        totalReviews: 0,
        avgRating: 0,
        recommendedCount: 0,
        ratingDist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
    const q = qrMap[qid];
    q.totalReviews++;
    q.avgRating += r.rating;
    if (r.recommended) q.recommendedCount++;
    q.ratingDist[r.rating] = (q.ratingDist[r.rating] || 0) + 1;
  });
  const qrStatsList = Object.values(qrMap).map((q) => ({
    ...q,
    avgRating: q.totalReviews > 0 ? q.avgRating / q.totalReviews : 0,
  })).sort((a,b) => a.qr_id.localeCompare(b.qr_id, undefined, {numeric: true, sensitivity: 'base'}));

  const uniqueBatches = batches.length;
  const uniqueQRs = qrStatsList.length;

  // Geography stats
  const countryCoordinates: Record<string, [number, number]> = {
    "Sri Lanka": [80.7718, 7.8731],
    "United States": [-95.7129, 37.0902],
    "United Kingdom": [-3.4360, 55.3781],
    "India": [78.9629, 20.5937],
    "United Arab Emirates": [53.8478, 23.4241],
    "Australia": [133.7751, -25.2744],
    "Germany": [10.4515, 51.1657],
    "France": [2.2137, 46.2276],
    "Japan": [138.2529, 36.2048],
    "Singapore": [103.8198, 1.3521],
  };

  const geoMap: Record<string, { country: string; count: number; cities: Set<string>; coordinates: [number, number] }> = {};
  reviews.forEach((r) => {
    const country = r.location_country || "Sri Lanka"; // Fallback to Sri Lanka for testing
    if (!geoMap[country]) {
      geoMap[country] = {
        country,
        count: 0,
        cities: new Set(),
        coordinates: countryCoordinates[country] || [80.77, 7.87],
      };
    }
    geoMap[country].count++;
    if (r.location_city) geoMap[country].cities.add(r.location_city);
  });
  const geoData = Object.values(geoMap).map(g => ({
    ...g,
    cities: Array.from(g.cities),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 sm:px-12 pt-8 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium opacity-80">Basilur</p>
            <p className="text-sm font-semibold text-foreground leading-tight">Review Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="hidden sm:inline text-[10px] tracking-widest uppercase text-muted-foreground font-medium opacity-80">Admin</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-12 space-y-12">
        {loading && (
          <div className="flex items-center justify-center py-40">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">
            Failed to load data: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Overview Cards */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs tracking-widest uppercase text-slate-500 mb-5 font-medium"
              >
                Overview
              </motion.h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Reviews"
                  value={totalReviews}
                  sub="All batches combined"
                  delay={0}
                />
                <StatCard
                  icon={Star}
                  label="Avg. Rating"
                  value={avgRating.toFixed(2)}
                  sub="Out of 5 stars"
                  delay={0.08}
                />
                <StatCard
                  icon={ThumbsUp}
                  label="Recommended"
                  value={`${recommendedPct}%`}
                  sub={`${recommendedCount} of ${totalReviews} users`}
                  delay={0.16}
                />
                <StatCard
                  icon={Package}
                  label="Batches"
                  value={uniqueBatches}
                  sub="Distinct batch IDs"
                  delay={0.24}
                />
                <StatCard
                  icon={Package}
                  label="QR Codes"
                  value={uniqueQRs}
                  sub="Active QR identifiers"
                  delay={0.32}
                />
              </div>
            </section>

            {/* Global Rating Distribution */}
            <section className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm shadow-sm"
              >
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6 font-medium">
                  Rating Distribution
                </p>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <RatingBar
                      key={star}
                      star={star}
                      count={globalRatingDist[star] || 0}
                      total={totalReviews}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Recommendation Split */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.38 }}
                className="bg-card border border-border rounded-2xl p-6 backdrop-blur-sm shadow-sm"
              >
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6 font-medium">
                  Recommendation Split
                </p>
                <div className="flex items-end gap-4 h-28">
                  {/* Would Recommend bar */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{recommendedPct}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${recommendedPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg"
                      style={{ minHeight: "4px" }}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      Yes
                    </div>
                  </div>
                  {/* Would Not Recommend bar */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{100 - recommendedPct}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${100 - recommendedPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
                      className="w-full bg-gradient-to-t from-rose-700 to-rose-500 rounded-t-lg"
                      style={{ minHeight: "4px" }}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      Not for me
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* World Map Analytics */}
            <section className="grid lg:grid-cols-[1fr_300px] gap-6">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <MapChart data={geoData} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-card border border-border rounded-3xl p-6 backdrop-blur-sm shadow-sm"
              >
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6 font-medium">Top Regions</p>
                <div className="space-y-4">
                   {geoData.sort((a,b) => b.count - a.count).slice(0, 5).map((g, idx) => (
                      <div key={g.country} className="flex flex-col gap-1">
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground/90">{g.country}</span>
                            <span className="text-xs font-bold text-amber-400">{g.count}</span>
                         </div>
                         <div className="text-[10px] text-muted-foreground line-clamp-1 opacity-70">
                            {g.cities.join(", ")}
                         </div>
                         <div className="w-full h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(g.count / totalReviews) * 100}%` }}
                               className="h-full bg-amber-400/30"
                            />
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            </section>

            {/* Per-Batch Breakdown */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs tracking-widest uppercase text-muted-foreground mb-5 font-medium flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Batch Breakdown
              </motion.h2>

              <div className="space-y-3">
                {batches.map((batch, i) => {
                  const recPct =
                    batch.totalReviews > 0
                      ? Math.round((batch.recommendedCount / batch.totalReviews) * 100)
                      : 0;
                  return (
                    <motion.div
                      key={batch.batch_id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.44 + i * 0.06 }}
                      className="bg-card/50 border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 hover:bg-card/80 transition-colors shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-foreground tracking-wide">
                            {batch.batch_id}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border">
                            {batch.totalReviews} review{batch.totalReviews !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarDisplay value={batch.avgRating} />
                          <span className="text-xs text-muted-foreground">
                            {batch.avgRating.toFixed(1)} avg
                          </span>
                        </div>
                        {/* Mini rating dist */}
                        <div className="flex gap-1 pt-1">
                          {[5, 4, 3, 2, 1].map((s) => {
                            const cnt = batch.ratingDist[s] || 0;
                            const h =
                              batch.totalReviews > 0
                                ? Math.max(2, (cnt / batch.totalReviews) * 32)
                                : 2;
                            return (
                              <div
                                key={s}
                                title={`${s}★: ${cnt}`}
                                className="w-4 rounded-sm bg-amber-400/30"
                                style={{ height: `${h}px`, alignSelf: "flex-end" }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                            recPct >= 70
                              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                              : recPct >= 50
                              ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                              : "text-rose-400 bg-rose-400/10 border-rose-400/20"
                          }`}
                        >
                          {recPct >= 50 ? (
                            <ThumbsUp className="w-3 h-3" />
                          ) : (
                            <ThumbsDown className="w-3 h-3" />
                          )}
                          {recPct}% rec.
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Per-QR Breakdown */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-xs tracking-widest uppercase text-muted-foreground mb-5 font-medium flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                QR Code Analytics
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qrStatsList.map((qr, i) => {
                  const recPct =
                    qr.totalReviews > 0
                      ? Math.round((qr.recommendedCount / qr.totalReviews) * 100)
                      : 0;
                  return (
                    <motion.div
                      key={qr.qr_id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
                      className="bg-card/50 border border-border rounded-2xl p-5 flex flex-col gap-4 hover:bg-card/80 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-amber-400 tracking-wide">
                              QR-{qr.qr_id}
                            </span>
                            <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border uppercase tracking-widest">
                              {qr.totalReviews} Responses
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <StarDisplay value={qr.avgRating} />
                            <span className="text-xs text-muted-foreground">
                              {qr.avgRating.toFixed(1)} average
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                            recPct >= 70
                              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                              : recPct >= 50
                              ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                              : "text-rose-400 bg-rose-400/10 border-rose-400/20"
                          }`}
                        >
                          {recPct}% recommended
                        </div>
                      </div>

                      {/* Rating bars */}
                      <div className="grid grid-cols-5 gap-1 items-end h-8">
                        {[5, 4, 3, 2, 1].map((s) => {
                          const cnt = qr.ratingDist[s] || 0;
                          const pct = qr.totalReviews > 0 ? (cnt / qr.totalReviews) * 100 : 0;
                          return (
                            <div key={s} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className="w-full bg-amber-400/20 rounded-t-sm transition-all duration-500" 
                                style={{ height: `${Math.max(4, pct * 0.3)}px` }}
                              />
                              <span className="text-[8px] text-muted-foreground font-mono opacity-60">{s}★</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Recent Reviews Table */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs tracking-widest uppercase text-muted-foreground mb-5 font-medium"
              >
                Recent Submissions
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.54 }}
                className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          Batch
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          QR ID
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          Location
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          Rating
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          Recommend
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-muted-foreground font-medium">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.slice(0, 20).map((review, i) => (
                        <motion.tr
                          key={review.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.56 + i * 0.02 }}
                          className="border-b border-border/50 last:border-0 hover:bg-accent/5 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground opacity-70">
                            {review.batch_id}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-amber-500 font-semibold opacity-90">
                            {review.qr_id || "-"}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground">
                            {review.location_city ? `${review.location_city}, ${review.location_country}` : (review.ip_address ? "Detecting..." : "Unknown")}
                          </td>
                          <td className="px-4 py-3.5">
                            <StarDisplay value={review.rating} />
                          </td>
                          <td className="px-4 py-3.5">
                            {review.recommended ? (
                              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                <ThumbsUp className="w-3 h-3 text-emerald-500" /> Yes
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                                <ThumbsDown className="w-3 h-3 text-rose-500" /> No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground opacity-80 whitespace-nowrap">
                            {new Date(review.created_at).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "Asia/Colombo",
                            })}
                            {" (+5:30)"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reviews.length > 20 && (
                  <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground opacity-60">
                    Showing 20 of {reviews.length} reviews
                  </div>
                )}
              </motion.div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
