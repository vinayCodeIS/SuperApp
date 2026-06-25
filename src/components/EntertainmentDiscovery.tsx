import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Movie } from "../types";
import { Star, Clock, Calendar, X, Play, ArrowLeft } from "lucide-react";

interface EntertainmentDiscoveryProps {
  selectedCategoryIds: string[];
  onBackToDashboard: () => void;
}

export default function EntertainmentDiscovery({
  selectedCategoryIds,
  onBackToDashboard,
}: EntertainmentDiscoveryProps) {
  const [moviesByCategory, setMoviesByCategory] = useState<Record<string, Movie[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<Record<string, boolean>>({});
  const [errorCategory, setErrorCategory] = useState<Record<string, string>>({});
  
  // Modal State
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const fetchMoviesForCategory = async (catId: string) => {
    setLoadingCategory(prev => ({ ...prev, [catId]: true }));
    setErrorCategory(prev => ({ ...prev, [catId]: "" }));
    try {
      const response = await fetch(`/api/movies?category=${encodeURIComponent(catId)}`);
      if (!response.ok) throw new Error("Failed to load movies");
      const list = await response.json();
      setMoviesByCategory(prev => ({ ...prev, [catId]: list }));
    } catch (err: any) {
      setErrorCategory(prev => ({ ...prev, [catId]: err.message || "Failed to fetch" }));
    } finally {
      setLoadingCategory(prev => ({ ...prev, [catId]: false }));
    }
  };

  useEffect(() => {
    selectedCategoryIds.forEach((catId) => {
      fetchMoviesForCategory(catId);
    });
  }, [selectedCategoryIds]);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans flex flex-col justify-between selection:bg-[#72DB73] selection:text-black" id="entertainment-discovery-screen">
      
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Page Top Header Bar (Matching Page 5 specs) */}
        <div className="flex justify-between items-center mb-8 select-none">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-full border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white transition duration-150"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[28px] logo-font text-[#72DB73] font-normal tracking-wide">
              Super app
            </h1>
          </div>

          {/* Headphones avatar top-right corner */}
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-zinc-800 shadow-md shrink-0">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80"
              alt="DJ Cartoon Headphones Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Subtitle Header */}
        <div className="text-left mb-10">
          <h2 className="text-[22px] md:text-[24px] letter-space text-white tracking-wide roboto-font">
            Entertainment according to your choice
          </h2>
        </div>

        {/* Dynamic Category Lists */}
        <div className="space-y-12">
          {selectedCategoryIds.map((catId) => {
            const movies = moviesByCategory[catId] || [];
            const isLoading = loadingCategory[catId];
            const hasError = errorCategory[catId];

            return (
              <div key={catId} className="space-y-4">
                {/* Category Row Label */}
                <div className="flex justify-between items-center">
                  <h3 className="text-[18px] md:text-[20px] font-bold text-[#8A8A8A] capitalize roboto-font tracking-wide text-left">
                    {catId}
                  </h3>
                </div>

                {/* Horizontal list of movie posters */}
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="aspect-[1.6/1] bg-zinc-900/40 rounded-[20px] border border-zinc-900 flex flex-col justify-end p-4 animate-pulse">
                        <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-zinc-800 rounded" />
                      </div>
                    ))}
                  </div>
                ) : hasError ? (
                  <div className="bg-zinc-950 border border-zinc-900 rounded-[20px] p-6 text-center text-xs text-zinc-500">
                    <p>Could not retrieve movie collection for "{catId}".</p>
                    <button
                      onClick={() => fetchMoviesForCategory(catId)}
                      className="text-[#72DB73] font-mono mt-2 underline"
                    >
                      Retry loading
                    </button>
                  </div>
                ) : movies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {movies.map((movie, index) => {
                      // Custom "N" Netflix badge for specific items like Oxygen
                      const isNetflixOriginal = movie.title.toLowerCase() === "oxygen";

                      return (
                        <motion.div
                          key={movie.title + index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.04 }}
                          onClick={() => setActiveMovie(movie)}
                          className="group cursor-pointer aspect-[1.6/1] bg-zinc-900/60 rounded-[20px] border-4 border-transparent overflow-hidden relative shadow-lg transition duration-300 hover:border-[#72DB73] select-none flex flex-col justify-end"
                        >
                          {/* Movie Landscape Poster Image */}
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                          {/* "N" Netflix Badge overlay for Oxygen movie matching Page 5 */}
                          {isNetflixOriginal && (
                            <div className="absolute top-2.5 left-2.5 z-10 font-black text-[#E50914] text-[18px] select-none font-sans drop-shadow-md">
                              N
                            </div>
                          )}

                          {/* Content Overlay */}
                          <div className="relative p-4 space-y-1.5 z-10 text-left">
                            {/* Rating badge */}
                            <div className="inline-flex items-center space-x-1 py-0.5 px-1.5 bg-black/80 border border-zinc-800 rounded text-[9px] font-bold text-amber-400">
                              <Star size={8} className="fill-amber-400 text-amber-400" />
                              <span>{movie.rating}</span>
                            </div>

                            {/* Title */}
                            <h4 className="text-[13px] md:text-[14px] font-extrabold tracking-tight text-white leading-tight line-clamp-1 group-hover:text-[#72DB73] transition">
                              {movie.title}
                            </h4>

                            {/* Release metadata */}
                            <div className="flex items-center space-x-2 text-[9px] text-zinc-400 font-mono">
                              <span>{movie.year}</span>
                              <span>•</span>
                              <span>{movie.duration}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic py-4 text-left">No movies matched category.</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Modal Pop-up */}
      <AnimatePresence>
        {activeMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setActiveMovie(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden max-w-2xl w-full grid grid-cols-1 md:grid-cols-12 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative text-left"
            >
              {/* Close Button top-right */}
              <button
                onClick={() => setActiveMovie(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 border border-zinc-800 hover:border-zinc-500 hover:text-red-400 transition"
                title="Close"
              >
                <X size={14} />
              </button>

              {/* Poster Column */}
              <div className="md:col-span-5 h-64 md:h-auto relative bg-zinc-900 select-none border-b md:border-b-0 md:border-r border-zinc-900">
                <img
                  src={activeMovie.posterUrl}
                  alt={activeMovie.title}
                  className="w-full h-full object-cover opacity-75"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-950 via-transparent to-transparent pointer-events-none" />
                
                {/* Watch indicator */}
                <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-2 text-[10px] font-mono bg-[#72DB73] text-black font-bold py-1.5 px-3.5 rounded-full uppercase tracking-wider shadow">
                  <Play size={10} className="fill-black" />
                  <span>Interactive Teaser</span>
                </div>
              </div>

              {/* Details Column */}
              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6 text-left">
                {/* Headers */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* IMDb rating badge */}
                    <div className="inline-flex items-center space-x-1.5 py-0.5 px-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs font-bold text-amber-400">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{activeMovie.rating} IMDb</span>
                    </div>

                    <span className="text-zinc-600 font-mono text-xs">|</span>

                    <div className="text-zinc-400 text-xs font-mono flex items-center space-x-3">
                      <span className="flex items-center space-x-1"><Calendar size={12} /> <span>{activeMovie.year}</span></span>
                      <span className="flex items-center space-x-1"><Clock size={12} /> <span>{activeMovie.duration}</span></span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                    {activeMovie.title}
                  </h3>
                </div>

                {/* Plot / Synopsis */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono tracking-wider text-[#72DB73] uppercase">Synopsis</span>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                    {activeMovie.plot}
                  </p>
                </div>

                {/* Crew info */}
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/80 pt-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">DIRECTOR</span>
                    <span className="text-zinc-300 font-bold">{activeMovie.director}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase block">STARRING CAST</span>
                    <span className="text-zinc-300 font-medium truncate block" title={activeMovie.actors}>{activeMovie.actors}</span>
                  </div>
                </div>

                {/* Footer close */}
                <div className="pt-2">
                  <button
                    onClick={() => setActiveMovie(null)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition border border-zinc-800"
                  >
                    Close Details
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
