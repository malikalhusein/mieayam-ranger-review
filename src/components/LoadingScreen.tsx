import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen = ({ onComplete, duration = 2500 }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-hero transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Noodle Bowl Animation */}
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        {/* Steam particles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8">
          <div className="flex gap-3">
            <div className="w-2 h-8 bg-white/30 rounded-full animate-steam-1" />
            <div className="w-2 h-10 bg-white/20 rounded-full animate-steam-2" />
            <div className="w-2 h-6 bg-white/30 rounded-full animate-steam-3" />
          </div>
        </div>

        {/* Bowl */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-24 md:w-52 md:h-28">
          {/* Bowl outer */}
          <div className="absolute inset-0 bg-white rounded-b-[100px] rounded-t-3xl shadow-lg" />
          {/* Bowl inner rim */}
          <div className="absolute top-2 left-2 right-2 h-4 bg-muted rounded-t-2xl" />
          {/* Broth */}
          <div className="absolute top-4 left-4 right-4 bottom-4 bg-gradient-to-b from-amber-200 to-amber-300 rounded-b-[80px] overflow-hidden">
            {/* Broth shine */}
            <div className="absolute top-1 left-4 w-16 h-3 bg-white/30 rounded-full rotate-12" />
          </div>
          {/* Bowl decoration */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
          </div>
        </div>

        {/* Chopsticks with noodles */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-lift-noodles">
          {/* Chopstick 1 */}
          <div className="absolute -left-6 top-0 w-2 h-32 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full transform -rotate-12 origin-bottom" />
          {/* Chopstick 2 */}
          <div className="absolute left-4 top-0 w-2 h-32 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full transform rotate-12 origin-bottom" />
          
          {/* Noodles hanging */}
          <svg
            className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-20"
            viewBox="0 0 64 80"
          >
            {/* Noodle strands */}
            <path
              d="M20,0 Q15,20 22,40 Q28,60 20,80"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-noodle-wave-1"
            />
            <path
              d="M28,0 Q35,25 28,45 Q22,65 30,80"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-noodle-wave-2"
            />
            <path
              d="M36,0 Q30,20 38,42 Q44,62 36,80"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-noodle-wave-3"
            />
            <path
              d="M44,0 Q50,22 42,44 Q36,66 45,80"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-noodle-wave-1"
            />
          </svg>
        </div>
      </div>

      {/* Brand text */}
      <div className="mt-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg animate-pulse">
          Mie Ayam Ranger
        </h1>
        <p className="text-white/80 mt-2 text-sm md:text-base">
          Memuat rekomendasi terbaik...
        </p>
      </div>

      {/* Loading dots */}
      <div className="mt-6 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-3 h-3 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-3 h-3 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
