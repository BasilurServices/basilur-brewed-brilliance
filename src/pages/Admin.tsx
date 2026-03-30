import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, BarChart3, Users, TrendingUp, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  batch_id: string;
  rating: number;
  recommended: boolean;
  created_at: string;
}

interface BatchStats {
  batch_id: string;
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
          s <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-700"
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
    className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 backdrop-blur-sm hover:bg-white/8 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-amber-400" strokeWidth={1.8} />
      </div>
      <span className="text-xs tracking-widest uppercase text-slate-400 font-medium">{label}</span>
    </div>
    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </motion.div>
);

const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-slate-400 w-4 text-right">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
        />
      </div>
      <span className="text-slate-500 w-5 text-right">{count}</span>
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

  const uniqueBatches = batches.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 sm:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-slate-500 font-medium">Basilur</p>
            <p className="text-sm font-semibold text-white leading-tight">Review Analytics</p>
          </div>
        </div>
        <span className="text-xs tracking-widest uppercase text-slate-600 font-medium">Admin</span>
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
              </div>
            </section>

            {/* Global Rating Distribution */}
            <section className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <p className="text-xs tracking-widest uppercase text-slate-500 mb-6 font-medium">
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
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
              >
                <p className="text-xs tracking-widest uppercase text-slate-500 mb-6 font-medium">
                  Recommendation Split
                </p>
                <div className="flex items-end gap-4 h-28">
                  {/* Would Recommend bar */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400">{recommendedPct}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${recommendedPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg"
                      style={{ minHeight: "4px" }}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      Recommend
                    </div>
                  </div>
                  {/* Would Not Recommend bar */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-400">{100 - recommendedPct}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${100 - recommendedPct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
                      className="w-full bg-gradient-to-t from-rose-700 to-rose-500 rounded-t-lg"
                      style={{ minHeight: "4px" }}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      Not for me
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Per-Batch Breakdown */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs tracking-widest uppercase text-slate-500 mb-5 font-medium flex items-center gap-2"
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
                      className="bg-white/4 border border-white/8 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 hover:bg-white/6 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white tracking-wide">
                            {batch.batch_id}
                          </span>
                          <span className="text-xs text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">
                            {batch.totalReviews} review{batch.totalReviews !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <StarDisplay value={batch.avgRating} />
                          <span className="text-xs text-slate-500">
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

            {/* Recent Reviews Table */}
            <section>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs tracking-widest uppercase text-slate-500 mb-5 font-medium"
              >
                Recent Submissions
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.54 }}
                className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="text-left px-6 py-4 text-xs tracking-widest uppercase text-slate-600 font-medium">
                          Batch
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-slate-600 font-medium">
                          Rating
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-slate-600 font-medium">
                          Recommend
                        </th>
                        <th className="text-left px-4 py-4 text-xs tracking-widest uppercase text-slate-600 font-medium">
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
                          className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-mono text-xs text-slate-400">
                            {review.batch_id}
                          </td>
                          <td className="px-4 py-3.5">
                            <StarDisplay value={review.rating} />
                          </td>
                          <td className="px-4 py-3.5">
                            {review.recommended ? (
                              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <ThumbsUp className="w-3 h-3" /> Yes
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs text-rose-400">
                                <ThumbsDown className="w-3 h-3" /> No
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">
                            {new Date(review.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reviews.length > 20 && (
                  <div className="px-6 py-3 border-t border-white/8 text-xs text-slate-600">
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
