import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import RegistrationForm from "./components/RegistrationForm";
import CategoryOnboarding from "./components/CategoryOnboarding";
import SuperDashboard from "./components/SuperDashboard";
import EntertainmentDiscovery from "./components/EntertainmentDiscovery";
import { User, AppStep } from "./types";

export default function App() {
  const [step, setStep] = useState<AppStep>("registration");
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // 1. Initial State Recovery on Mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("super_app_user");
      const storedCategories = localStorage.getItem("super_app_categories");
      const storedStep = localStorage.getItem("super_app_step") as AppStep | null;

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Ensure user is a valid object
        if (parsedUser && typeof parsedUser === "object" && "name" in parsedUser) {
          setUser(parsedUser);

          if (storedCategories) {
            const parsedCats = JSON.parse(storedCategories);
            if (Array.isArray(parsedCats)) {
              setSelectedCategoryIds(parsedCats);

              if (storedStep && ["dashboard", "movies"].includes(storedStep) && parsedCats.length >= 3) {
                setStep(storedStep);
              } else if (parsedCats.length >= 3) {
                setStep("dashboard");
              } else {
                setStep("categories");
              }
            } else {
              setSelectedCategoryIds([]);
              setStep("categories");
            }
          } else {
            setStep("categories");
          }
        } else {
          // Invalid user object in storage
          localStorage.removeItem("super_app_user");
          setStep("registration");
        }
      } else {
        setStep("registration");
      }
    } catch (err) {
      console.error("Failed to recover persistent state:", err);
      localStorage.removeItem("super_app_user");
      localStorage.removeItem("super_app_categories");
      localStorage.removeItem("super_app_step");
      setStep("registration");
    }
  }, []);

  // 2. State persistence helper
  const updateStep = (newStep: AppStep) => {
    setStep(newStep);
    localStorage.setItem("super_app_step", newStep);
  };

  const handleRegister = (registeredUser: User) => {
    setUser(registeredUser);
    localStorage.setItem("super_app_user", JSON.stringify(registeredUser));
    updateStep("categories");
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) => {
      const updated = prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId];
      localStorage.setItem("super_app_categories", JSON.stringify(updated));
      return updated;
    });
  };

  const handleProceedFromCategories = () => {
    if (selectedCategoryIds.length >= 3) {
      updateStep("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("super_app_user");
    localStorage.removeItem("super_app_categories");
    localStorage.removeItem("super_app_step");
    localStorage.removeItem("super_app_notes");
    setUser(null);
    setSelectedCategoryIds([]);
    setStep("registration");
  };

  // Staggered slide and fade slide layout animation for steps
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black antialiased font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-full"
        >
          {step === "registration" && (
            <RegistrationForm onRegister={handleRegister} initialUser={user} />
          )}

          {step === "categories" && (
            <CategoryOnboarding
              selectedCategoryIds={selectedCategoryIds}
              onToggleCategory={handleToggleCategory}
              onProceed={handleProceedFromCategories}
              onBack={() => updateStep("registration")}
            />
          )}

          {step === "dashboard" && user && (
            <SuperDashboard
              user={user}
              selectedCategoryIds={selectedCategoryIds}
              onNavigateToMovies={() => updateStep("movies")}
              onLogout={handleLogout}
            />
          )}

          {step === "movies" && (
            <EntertainmentDiscovery
              selectedCategoryIds={selectedCategoryIds}
              onBackToDashboard={() => updateStep("dashboard")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
