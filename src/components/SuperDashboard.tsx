import React, { useState, useEffect, useRef } from "react";
import { User, WeatherData, NewsArticle } from "../types";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SuperDashboardProps {
  user: User;
  selectedCategoryIds: string[];
  onNavigateToMovies: () => void;
  onLogout: () => void;
}

export default function SuperDashboard({
  user,
  selectedCategoryIds,
  onNavigateToMovies,
  onLogout,
}: SuperDashboardProps) {
  // --- Current Date & Time ---
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const m = String(date.getMonth() + 1);
    const d = String(date.getDate());
    const y = date.getFullYear();
    return `${m}-${d}-${y}`;
  };

  const formatTime = (date: Date) => {
    let hrs = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, "0");
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; // the hour '0' should be '12'
    const hrsStr = String(hrs).padStart(2, "0");
    return `${hrsStr}:${mins} ${ampm}`;
  };

  // --- Notes State ---
  const [notes, setNotes] = useState(() => {
    return (
      localStorage.getItem("super_app_notes") ||
      "This is how I am going to learn MERN Stack in next 3 months."
    );
  });

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem("super_app_notes", val);
  };

  // --- Timer State (Countdown Timer) ---
  const [hours, setHours] = useState(5);
  const [minutes, setMinutes] = useState(8);
  const [seconds, setSeconds] = useState(56);
  const [totalSeconds, setTotalSeconds] = useState(18536); // 5:08:56
  const [remainingSeconds, setRemainingSeconds] = useState(18536);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTimerNumber = (num: number) => String(num).padStart(2, "0");

  const incrementHours = () => {
    if (timerRunning) return;
    setHours((h) => (h < 23 ? h + 1 : 0));
  };
  const decrementHours = () => {
    if (timerRunning) return;
    setHours((h) => (h > 0 ? h - 1 : 23));
  };
  const incrementMinutes = () => {
    if (timerRunning) return;
    setMinutes((m) => (m < 59 ? m + 1 : 0));
  };
  const decrementMinutes = () => {
    if (timerRunning) return;
    setMinutes((m) => (m > 0 ? m - 1 : 59));
  };
  const incrementSeconds = () => {
    if (timerRunning) return;
    setSeconds((s) => (s < 59 ? s + 1 : 0));
  };
  const decrementSeconds = () => {
    if (timerRunning) return;
    setSeconds((s) => (s > 0 ? s - 1 : 59));
  };

  const handleStartStop = () => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      const calculatedSeconds = hours * 3600 + minutes * 60 + seconds;
      if (calculatedSeconds === 0) return;
      setTotalSeconds(calculatedSeconds);
      setRemainingSeconds(calculatedSeconds);
      setTimerRunning(true);
    }
  };

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            playAlarmBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning]);

  const playAlarmBeep = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (err) {
      console.warn("Audio feedback failed:", err);
    }
  };

  // --- Weather & News Live Fetch State ---
  const [weatherCity, setWeatherCity] = useState(() => {
    return localStorage.getItem("super_app_weather_city") || "New York";
  });
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [cityInput, setCityInput] = useState("");

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    // 1. Fetch weather details (utilizing OpenWeatherMap/Gemini via our server API)
    setWeatherLoading(true);
    fetch(`/api/weather?city=${encodeURIComponent(weatherCity)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load weather");
        return res.json();
      })
      .then((data: WeatherData) => {
        setWeather(data);
        setWeatherError(false);
      })
      .catch((err) => {
        console.error("Weather load error:", err);
        setWeatherError(true);
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  }, [weatherCity]);

  useEffect(() => {
    // 2. Fetch live news articles (utilizing News API / World News API / Gemini)
    setNewsLoading(true);
    fetch("/api/news")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load news");
        return res.json();
      })
      .then((data: NewsArticle[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setNewsList(data);
          setNewsError(false);
        } else {
          throw new Error("Invalid news format received");
        }
      })
      .catch((err) => {
        console.error("News load error:", err);
        setNewsError(true);
      })
      .finally(() => {
        setNewsLoading(false);
      });
  }, []);

  const renderWeatherIcon = (desc: string) => {
    const d = desc.toLowerCase();
    if (d === "sunny") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#FFD700]" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" />
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41-1.41" />
        </svg>
      );
    }
    if (d === "cloudy") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      );
    }
    if (d === "rainy") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v2m3-2v2m3-2v2" />
        </svg>
      );
    }
    if (d === "thunderstorm") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.5 15.5L9.5 19h4l-2 3" />
        </svg>
      );
    }
    if (d === "snowy") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m4-4l10 10m0-10L7 17" />
        </svg>
      );
    }
    if (d === "windy") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4M22 8.5H8M16 15.5H2" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    );
  };

  // Convert remaining seconds back to H:M:S for digital dial readout
  const displayHours = Math.floor(remainingSeconds / 3600);
  const displayMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const displaySeconds = remainingSeconds % 60;

  // Circle progress math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-8 font-sans flex flex-col justify-between selection:bg-[#72DB73] selection:text-black" id="super-dashboard-screen">
      
      {/* Main Bento Grid layout matching uploaded Page 4 */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Left Columns Container (Profile, Weather, Notes, Timer) - col-span-8 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top Row: Profile + Weather (Col 1) and Notes (Col 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Column 1: Profile card & Weather card stacked */}
            <div className="flex flex-col gap-6 justify-between">
              
              {/* User Profile Widget */}
              <div className="bg-[#5746FA] rounded-[30px] p-6 flex flex-row items-center space-x-6 relative shadow-xl overflow-hidden min-h-[190px] flex-1">
                {/* Logout button positioned elegantly in the corner */}
                <button
                  onClick={onLogout}
                  className="absolute top-4 right-5 text-white/50 hover:text-white text-[11px] font-mono tracking-wider uppercase transition bg-black/20 hover:bg-black/40 py-1 px-2.5 rounded-full focus:outline-none"
                  title="Logout"
                >
                  Logout
                </button>

                {/* Vertical capsule-shaped avatar with white border */}
                <div className="w-[100px] h-[145px] rounded-[28px] border-[3px] border-white overflow-hidden bg-zinc-800 shrink-0 select-none shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80"
                    alt="DJ Cartoon Headphones Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* User Metadata on the right */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                  <p className="text-white text-[15px] md:text-[16px] font-normal tracking-wide dm-font">
                    {user.name}
                  </p>
                  <p className="text-white text-[13px] md:text-[14px] font-normal tracking-wide opacity-80 dm-font mb-1 truncate">
                    {user.email}
                  </p>
                  <h3 className="text-white text-[32px] md:text-[40px] font-bold leading-none tracking-tight truncate dm-font mb-3">
                    {user.username}
                  </h3>

                  {/* Selected categories tags arranged in 2x2 capsules */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCategoryIds.slice(0, 4).map((catId) => (
                      <span
                        key={catId}
                        className="py-1 px-2.5 bg-[#9F94FF]/60 rounded-full text-white font-sans text-center font-medium text-[12px] md:text-[13px] tracking-wide capitalize select-none truncate"
                      >
                        {catId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="rounded-[30px] overflow-hidden flex flex-col shadow-xl shrink-0">
                {/* Top hot pink datetime status bar */}
                <div className="bg-[#FF29B9] py-3.5 px-6 flex justify-between items-center text-white font-bold text-[18px] md:text-[20px] tracking-wider roboto-font">
                  <span>{formatDate(currentDateTime)}</span>
                  <span>{formatTime(currentDateTime)}</span>
                </div>

                {/* Bottom navy blue weather stats bar */}
                <div className="bg-[#10111E] p-5 flex flex-row items-center justify-between text-white text-left min-h-[100px]">
                  {weatherLoading ? (
                    <div className="flex-1 flex items-center justify-center py-2 space-x-2 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <div className="w-2 h-2 rounded-full bg-white delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-white delay-150"></div>
                      <span className="text-zinc-400 font-sans text-xs uppercase tracking-wider pl-2">Syncing forecast...</span>
                    </div>
                  ) : weatherError || !weather ? (
                    // Elegant static design fallback
                    <>
                      {/* Left Column: Heavy Rain */}
                      <div className="flex flex-col items-center justify-center text-center space-y-1.5 shrink-0 pr-2">
                        {renderWeatherIcon("rainy")}
                        <span className="text-[14px] roboto-font font-medium tracking-wide">
                          Heavy rain
                        </span>
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-[1.5px] h-14 bg-white/20" />

                      {/* Middle Column: Temperature & Pressure */}
                      <div className="flex-1 px-4 space-y-2 text-center">
                        <span className="text-[38px] font-light leading-none block roboto-font">
                          24°C
                        </span>
                        <div className="flex items-center justify-center space-x-1 text-[11px] font-light text-zinc-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
                          </svg>
                          <span className="whitespace-nowrap">1010 mbar Pressure</span>
                        </div>
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-[1.5px] h-14 bg-white/20" />

                      {/* Right Column: Wind & Humidity */}
                      <div className="flex flex-col space-y-2 text-[11px] font-light text-zinc-300 pr-1 shrink-0">
                        {/* Wind Row */}
                        <div className="flex items-center space-x-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4M22 8.5H8M16 15.5H2" />
                          </svg>
                          <span className="whitespace-nowrap">3.7 km/h Wind</span>
                        </div>

                        {/* Humidity Row */}
                        <div className="flex items-center space-x-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.105-7.5 11.25-7.5 11.25S4.5 17.605 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="whitespace-nowrap">83% Humidity</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Dynamic live forecast fetched with api key
                    <>
                      {/* Left Column: Live Condition */}
                      <div className="flex flex-col items-center justify-center text-center space-y-1.5 shrink-0 pr-2 max-w-[110px]">
                        {renderWeatherIcon(weather.iconDescription || weather.condition)}
                        <span className="text-[13px] md:text-[14px] roboto-font font-medium tracking-wide truncate capitalize" title={weather.condition}>
                          {weather.condition}
                        </span>
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-[1.5px] h-14 bg-white/20" />

                      {/* Middle Column: Dynamic Temperature & Pressure */}
                      <div className="flex-1 px-4 space-y-2 text-center">
                        <span className="text-[34px] md:text-[38px] font-light leading-none block roboto-font">
                          {weather.temperature}°C
                        </span>
                        <div className="flex items-center justify-center space-x-1 text-[11px] font-light text-zinc-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
                          </svg>
                          {isEditingCity ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (cityInput.trim()) {
                                  setWeatherCity(cityInput.trim());
                                  localStorage.setItem("super_app_weather_city", cityInput.trim());
                                }
                                setIsEditingCity(false);
                              }}
                              className="inline-flex items-center"
                              id="weather-city-form"
                            >
                              <input
                                type="text"
                                value={cityInput}
                                onChange={(e) => setCityInput(e.target.value)}
                                className="bg-zinc-800 text-white border border-zinc-600 rounded px-1.5 py-0.5 text-[11px] w-20 focus:outline-none focus:ring-1 focus:ring-pink-500 font-sans"
                                autoFocus
                                placeholder="City..."
                                onBlur={() => setTimeout(() => setIsEditingCity(false), 200)}
                              />
                            </form>
                          ) : (
                            <div
                              onClick={() => {
                                setCityInput(weatherCity);
                                setIsEditingCity(true);
                              }}
                              className="flex items-center space-x-1 cursor-pointer group hover:text-white transition duration-150"
                              title="Click to edit city"
                              id="weather-city-display"
                            >
                              <span className="whitespace-nowrap truncate max-w-[110px] border-b border-dashed border-zinc-500 group-hover:border-white">
                                {weather.city || weatherCity}
                              </span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-[1.5px] h-14 bg-white/20" />

                      {/* Right Column: Wind & Humidity */}
                      <div className="flex flex-col space-y-2 text-[11px] font-light text-zinc-300 pr-1 shrink-0">
                        {/* Wind Row */}
                        <div className="flex items-center space-x-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4M22 8.5H8M16 15.5H2" />
                          </svg>
                          <span className="whitespace-nowrap">{weather.windSpeed} km/h Wind</span>
                        </div>

                        {/* Humidity Row */}
                        <div className="flex items-center space-x-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.105-7.5 11.25-7.5 11.25S4.5 17.605 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span className="whitespace-nowrap">{weather.humidity}% Humidity</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Column 2: All Notes card */}
            <div className="flex flex-col">
              <div className="bg-[#FCD561] text-black rounded-[30px] p-7 flex flex-col h-full shadow-xl min-h-[350px] md:min-h-full">
                <h3 className="text-[28px] md:text-[32px] font-black tracking-tight text-left mb-4">
                  All notes
                </h3>
                <textarea
                  id="notes-textarea"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Jot down notes, learnings or todo items..."
                  className="w-full flex-1 bg-transparent text-black text-[15px] md:text-[16px] leading-relaxed font-sans placeholder-zinc-800/60 focus:outline-none resize-none overflow-y-auto pr-2 border-none"
                />
              </div>
            </div>

          </div>

          {/* Countdown Timer Widget - spans full width of left container */}
          <div className="bg-[#1E2035] rounded-[30px] p-6 flex flex-col md:flex-row items-center gap-8 shadow-xl">
            
            {/* Left circular progress countdown dial */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-[145px] h-[145px] transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-[#10111E]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-[#FF6A6A] transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={timerRunning || remainingSeconds > 0 ? strokeDashoffset : circumference}
                  strokeLinecap="round"
                />
              </svg>
              {/* Digit timer readout in center */}
              <div className="absolute font-mono text-[21px] md:text-[23px] font-normal text-white">
                {timerRunning || remainingSeconds > 0 ? (
                  `${formatTimerNumber(displayHours)}:${formatTimerNumber(displayMinutes)}:${formatTimerNumber(displaySeconds)}`
                ) : (
                  "05:08:56"
                )}
              </div>
            </div>

            {/* Right Adjustment panels and controls */}
            <div className="flex-1 flex flex-col justify-between space-y-4 w-full text-left">
              <div className="grid grid-cols-3 gap-6 text-center text-zinc-400 font-sans relative px-4">
                
                {/* Hours Block */}
                <div className="flex flex-col items-center">
                  <span className="text-[12px] uppercase tracking-wider text-zinc-400 mb-1">Hours</span>
                  <button onClick={incrementHours} className="py-1 focus:outline-none" title="Increment Hours">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 fill-zinc-500 hover:fill-white transition">
                      <path d="M12 6l-8 8h16z" />
                    </svg>
                  </button>
                  <span className="text-[36px] md:text-[44px] font-medium text-white font-mono leading-none my-1">
                    {formatTimerNumber(hours)}
                  </span>
                  <button onClick={decrementHours} className="py-1 focus:outline-none" title="Decrement Hours">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 fill-zinc-500 hover:fill-white transition">
                      <path d="M12 18l8-8H4z" />
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <span className="absolute left-[31%] top-1/2 -translate-y-1/2 text-[28px] font-medium text-white select-none">:</span>

                {/* Minutes Block */}
                <div className="flex flex-col items-center">
                  <span className="text-[12px] uppercase tracking-wider text-zinc-400 mb-1">Minutes</span>
                  <button onClick={incrementMinutes} className="py-1 focus:outline-none" title="Increment Minutes">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 fill-zinc-500 hover:fill-white transition">
                      <path d="M12 6l-8 8h16z" />
                    </svg>
                  </button>
                  <span className="text-[36px] md:text-[44px] font-medium text-white font-mono leading-none my-1">
                    {formatTimerNumber(minutes)}
                  </span>
                  <button onClick={decrementMinutes} className="py-1 focus:outline-none" title="Decrement Minutes">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 fill-zinc-500 hover:fill-white transition">
                      <path d="M12 18l8-8H4z" />
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <span className="absolute left-[64%] top-1/2 -translate-y-1/2 text-[28px] font-medium text-white select-none">:</span>

                {/* Seconds Block */}
                <div className="flex flex-col items-center">
                  <span className="text-[12px] uppercase tracking-wider text-zinc-400 mb-1">Seconds</span>
                  <button onClick={incrementSeconds} className="py-1 focus:outline-none" title="Increment Seconds">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 fill-zinc-500 hover:fill-white transition">
                      <path d="M12 6l-8 8h16z" />
                    </svg>
                  </button>
                  <span className="text-[36px] md:text-[44px] font-medium text-white font-mono leading-none my-1">
                    {formatTimerNumber(seconds)}
                  </span>
                  <button onClick={decrementSeconds} className="py-1 focus:outline-none" title="Decrement Seconds">
                    <svg viewBox="0 0 24 24" className="w-5 h-4 fill-zinc-500 hover:fill-white transition">
                      <path d="M12 18l8-8H4z" />
                    </svg>
                  </button>
                </div>

              </div>

              {/* Start / Pause Button */}
              <button
                onClick={handleStartStop}
                className="w-full bg-[#FF6A6A] hover:bg-[#ff5555] text-white font-bold py-2.5 px-4 rounded-full transition text-[16px] uppercase tracking-wider focus:outline-none"
              >
                {timerRunning ? "Pause" : "Start"}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column Container (Tall News feed & Browse Button underneath) - col-span-4 */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Snowy Mountain News vertical card */}
          <div className="bg-white text-black rounded-[30px] overflow-hidden shadow-xl flex flex-col flex-1 h-full min-h-[450px]">
            {newsLoading ? (
              <div className="flex-1 flex flex-col justify-between p-6 animate-pulse bg-white">
                <div className="space-y-4">
                  <div className="h-[200px] bg-zinc-200 rounded-[20px]" />
                  <div className="h-6 bg-zinc-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-100 rounded" />
                    <div className="h-4 bg-zinc-100 rounded" />
                    <div className="h-4 bg-zinc-100 rounded w-5/6" />
                  </div>
                </div>
                <div className="h-10 bg-zinc-200 rounded-full w-full mt-6" />
              </div>
            ) : newsError || newsList.length === 0 ? (
              // Elegant static design fallback
              <>
                {/* Top Half: Landscape snowy mountains photo */}
                <div className="relative h-[250px] md:h-[300px] lg:h-[45%] bg-zinc-950 overflow-hidden shrink-0 select-none">
                  <img
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"
                    alt="Everest Snowy Mountains"
                    className="w-full h-full object-cover"
                  />
                  {/* Ambient Dark overlay on bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-6 text-left z-10">
                    <h4 className="text-[20px] md:text-[24px] font-black tracking-tight leading-snug text-white font-sans">
                      Want to climb Mount Everest?
                    </h4>
                  </div>
                </div>

                {/* Bottom Half: news content body text */}
                <div className="p-6 md:p-8 flex flex-col justify-start text-left bg-white text-black flex-1 min-h-[200px]">
                  <div className="text-[14px] md:text-[15px] leading-relaxed text-[#3c3c3c] font-sans overflow-y-auto pr-1">
                    <p>
                      In the years since human beings first reached the summit of Mount Everest in
                      1953, climbing the world's highest mountain has changed dramatically. Today,
                      hundreds of mountaineers manage the feat each year thanks to improvements in
                      knowledge, technology, and the significant infrastructure provided by commercially
                      guided expeditions that provide a veritable highway up the mountain for those
                      willing to accept both the......
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Live news articles fetched from our server via newsAPI key!
              (() => {
                const article = newsList[currentNewsIndex];
                return (
                  <>
                    {/* Top Half: Landscape news photo */}
                    <div className="relative h-[250px] md:h-[300px] lg:h-[45%] bg-zinc-950 overflow-hidden shrink-0 select-none">
                      <img
                        src={article.imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback on image loading error
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      {/* Ambient Dark overlay on bottom */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 text-left z-10">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full truncate max-w-[120px]" title={article.source}>
                            {article.source}
                          </span>
                          <span className="text-[10px] text-zinc-300 font-mono">{article.publishedAt}</span>
                        </div>
                        <h4 className="text-[18px] md:text-[22px] font-black tracking-tight leading-snug text-white font-sans line-clamp-3" title={article.title}>
                          {article.title}
                        </h4>
                      </div>
                    </div>

                    {/* Bottom Half: news content body text */}
                    <div className="p-6 md:p-8 flex flex-col justify-between text-left bg-white text-black flex-1 min-h-[200px]">
                      <div className="text-[14px] md:text-[15px] leading-relaxed text-[#3c3c3c] font-sans overflow-y-auto pr-1 flex-1 mb-4">
                        <p>{article.summary}</p>
                      </div>

                      {/* News Carousel Navigation Controls */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 shrink-0">
                        <span className="text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
                          {currentNewsIndex + 1} of {newsList.length} Headlines
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentNewsIndex((prev) => (prev > 0 ? prev - 1 : newsList.length - 1))}
                            className="p-1.5 rounded-full hover:bg-zinc-100 transition text-zinc-700 cursor-pointer focus:outline-none border border-zinc-200"
                            title="Previous Article"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentNewsIndex((prev) => (prev < newsList.length - 1 ? prev + 1 : 0))}
                            className="p-1.5 rounded-full hover:bg-zinc-100 transition text-zinc-700 cursor-pointer focus:outline-none border border-zinc-200"
                            title="Next Article"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()
            )}
          </div>

          {/* Browse Movies Button aligned at the bottom right */}
          <div className="flex justify-end shrink-0">
            <button
              onClick={onNavigateToMovies}
              id="browse-movies-btn"
              className="bg-[#148A14] hover:bg-[#1bb81b] text-white font-bold py-2.5 px-10 rounded-full transition text-[15px] tracking-wide shadow-md uppercase font-sans cursor-pointer focus:outline-none"
            >
              Browse
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
