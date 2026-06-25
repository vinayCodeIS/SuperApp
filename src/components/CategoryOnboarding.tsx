import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Category } from "../types";
import { AlertTriangle, X } from "lucide-react";

// List of standard categories matching Page 2 Figma specifications exactly
const CATEGORIES: Category[] = [
  { 
    id: "action", 
    name: "action", 
    label: "Action", 
    emoji: "", 
    color: "#FF5209", 
    bgClass: "bg-[#FF5209]", 
    image: "assets/61e37c12c4dec726b2728f622e0515db4db88d29.png" 
  },
  { 
    id: "drama", 
    name: "drama", 
    label: "Drama", 
    emoji: "", 
    color: "#D7A4FF", 
    bgClass: "bg-[#D7A4FF]", 
    image: "assets/352f43afa4708c73abc57d453cde278b09fb1186.png" 
  },
  { 
    id: "romance", 
    name: "romance", 
    label: "Romance", 
    emoji: "", 
    color: "#11B823", 
    bgClass: "bg-[#11B823]", 
    image: "assets/9d537405d747debca63143d2755f3574107ddb23.png" 
  },
  { 
    id: "thriller", 
    name: "thriller", 
    label: "Thriller", 
    emoji: "", 
    color: "#84C2FF", 
    bgClass: "bg-[#84C2FF]", 
    image: "assets/6843a8c4f1eeda63160b7168e1e2f52bbc62513e.png" 
  },
  { 
    id: "western", 
    name: "western", 
    label: "Western", 
    emoji: "", 
    color: "#904117", 
    bgClass: "bg-[#904117]", 
    image: "assets/8b6ee1b7756c86e21bf5ba349baf91016ed9a8dc.png" 
  },
  { 
    id: "horror", 
    name: "horror", 
    label: "Horror", 
    emoji: "", 
    color: "#7358FF", 
    bgClass: "bg-[#7358FF]", 
    image: "assets/f21ad522b6c878d8a633609d8450cfb98511cc89.png" 
  },
  { 
    id: "fantasy", 
    name: "fantasy", 
    label: "Fantasy", 
    emoji: "", 
    color: "#FF4ADE", 
    bgClass: "bg-[#FF4ADE]", 
    image: "assets/fd1997fb6a3afa2b07953f793022c6eae90ea3c9.png" 
  },
  { 
    id: "music", 
    name: "music", 
    label: "Music", 
    emoji: "", 
    color: "#E72C2C", 
    bgClass: "bg-[#E72C2C]", 
    image: "assets/407d256f96a1a15bc0fe7621c72274bf0efc55f0.png" 
  },
  { 
    id: "fiction", 
    name: "fiction", 
    label: "Fiction", 
    emoji: "", 
    color: "#6CD061", 
    bgClass: "bg-[#6CD061]", 
    image: "assets/ab51ca628ce3412a242698db2503fd83abadde4c.png" 
  },
];

interface CategoryOnboardingProps {
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  onProceed: () => void;
  onBack: () => void;
}

export default function CategoryOnboarding({
  selectedCategoryIds,
  onToggleCategory,
  onProceed,
  onBack,
}: CategoryOnboardingProps) {
  
  const selectedCategories = CATEGORIES.filter((cat) =>
    selectedCategoryIds.includes(cat.id)
  );

  const isGatekeeperSatisfied = selectedCategoryIds.length >= 3;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-14 flex flex-col justify-between" id="category-onboarding-screen">
      
      {/* Container main grid layout */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
        
        {/* Left Side: Logo, Title, Selected Pills, Error warning */}
        <div className="md:col-span-5 flex flex-col justify-start space-y-8 py-2 md:py-6">
          
          {/* Logo & Headline */}
          <div className="space-y-6">
            <h1 className="text-[48px] logo-font text-[#72DB73] font-normal leading-none tracking-normal">
              Super app
            </h1>
            <h2 className="text-[40px] md:text-[56px] font-black leading-tight tracking-tight text-white roboto-font md:max-w-md">
              Choose your entertainment category
            </h2>
          </div>

          {/* Selected Categories pills on Left */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2.5">
              {selectedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center space-x-2.5 py-1.5 px-4 bg-[#148A14] text-white roboto-font text-[14px] rounded-full  select-none transition duration-150"
                >
                  <span className="capitalize">{cat.label}</span>
                  <button
                    onClick={() => onToggleCategory(cat.id)}
                    className="text-black font-extrabold hover:text-white transition duration-150 flex items-center justify-center p-0.5"
                    title="Remove"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gatekeeper Check / Error Warning on Left */}
          <div>
            {!isGatekeeperSatisfied && (
              <div
                className="flex items-center space-x-2 text-[#FF0000] text-[14px] font-medium py-1"
              >
                <AlertTriangle size={18} className="shrink-0" />
                <span className="roboto-font">Minimum 3 category required</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: 3x3 Category Grid */}
        <div className=" roboto-font md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5 w-full">
          {CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className={`relative cursor-pointer aspect-[1/1.1] rounded-2xl p-4 md:p-5 flex flex-col justify-between select-none overflow-hidden transition-all duration-150 ${
                  cat.bgClass
                } ${
                  isSelected 
                    ? "border-[5px] border-[#11B823]" 
                    : "border-[5px] border-transparent"
                }`}
              >
                {/* Title */}
                <h3 className="text-[20px] md:text-[24px] font-black tracking-wide text-white roboto-font text-left leading-none">
                  {cat.label}
                </h3>

                {/* Movie cropped image frame centered at bottom */}
                <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mt-3 shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Page / Action buttons bar at bottom-right */}
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center mt-10 md:mt-16 pt-4 border-t border-zinc-900">
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-white text-xs roboto-font tracking-wider uppercase transition"
        >
          &larr; Registration
        </button>

        <button
          onClick={onProceed}
          disabled={!isGatekeeperSatisfied}
          id="categories-proceed-btn"
          className={`py-2 px-8 rounded-full text-[14px] font-bold tracking-wide transition duration-150 ${
            isGatekeeperSatisfied
              ? "bg-[#148A14] text-white hover:bg-[#1bb81b] shadow-md cursor-pointer"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          Next Page
        </button>
      </div>

    </div>
  );
}
