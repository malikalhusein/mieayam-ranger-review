import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen = ({ onComplete, duration = 2500 }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero animate-gradient-shift" />
      
      {/* Parallax floating particles - Layer 1 (far) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-1-${i}`}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float-slow"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Parallax floating particles - Layer 2 (mid) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={`particle-2-${i}`}
            className="absolute w-3 h-3 bg-white/15 rounded-full animate-float-medium"
            style={{
              left: `${20 + i * 15}%`,
              top: `${25 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Parallax floating particles - Layer 3 (near) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={`particle-3-${i}`}
            className="absolute w-4 h-4 bg-white/20 rounded-full blur-sm animate-float-fast"
            style={{
              left: `${15 + i * 25}%`,
              top: `${35 + (i % 2) * 30}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow effect */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-radial from-amber-500/30 via-transparent to-transparent blur-3xl animate-pulse-slow"
        style={{
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
          transition: "transform 0.4s ease-out",
        }}
      />

      {/* Noodle Bowl Animation - Main content with parallax */}
      <div 
        className="relative w-48 h-48 md:w-64 md:h-64 z-10"
        style={{
          transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px) scale(${1 + Math.abs(mousePosition.y) * 0.02})`,
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Steam particles with enhanced animation */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8">
          <div className="flex gap-3">
            <div className="w-2 h-8 bg-white/40 rounded-full animate-steam-1 blur-[1px]" />
            <div className="w-2.5 h-12 bg-white/30 rounded-full animate-steam-2 blur-[1px]" />
            <div className="w-2 h-6 bg-white/35 rounded-full animate-steam-3 blur-[1px]" />
            <div className="w-1.5 h-10 bg-white/25 rounded-full animate-steam-1 blur-[1px]" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Bowl with shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-24 md:w-52 md:h-28">
          {/* Bowl shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-4 md:w-48 bg-black/20 rounded-full blur-md animate-bowl-shadow" />
          {/* Bowl outer */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100 rounded-b-[100px] rounded-t-3xl shadow-xl" />
          {/* Bowl inner rim */}
          <div className="absolute top-2 left-2 right-2 h-4 bg-gradient-to-b from-gray-200 to-gray-100 rounded-t-2xl" />
          {/* Broth */}
          <div className="absolute top-4 left-4 right-4 bottom-4 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 rounded-b-[80px] overflow-hidden">
            {/* Broth shine */}
            <div className="absolute top-1 left-4 w-16 h-3 bg-white/40 rounded-full rotate-12 animate-shine" />
            {/* Broth ripple */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-amber-500/30 rounded-full animate-ripple" />
          </div>
          {/* Bowl pattern */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/30" />
            <div className="w-2 h-2 rounded-full bg-primary/30" />
            <div className="w-2 h-2 rounded-full bg-primary/30" />
          </div>
        </div>

        {/* Chopsticks with noodles */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-lift-noodles">
          {/* Chopstick 1 */}
          <div className="absolute -left-6 top-0 w-2 h-32 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-full transform -rotate-12 origin-bottom shadow-md" />
          {/* Chopstick 2 */}
          <div className="absolute left-4 top-0 w-2 h-32 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-full transform rotate-12 origin-bottom shadow-md" />
          
          {/* Noodles hanging */}
          <svg
            className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-20 drop-shadow-sm"
            viewBox="0 0 64 80"
          >
            {/* Noodle strands with gradient */}
            <defs>
              <linearGradient id="noodleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </linearGradient>
            </defs>
            <path
              d="M20,0 Q15,20 22,40 Q28,60 20,80"
              fill="none"
              stroke="url(#noodleGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-noodle-wave-1"
            />
            <path
              d="M28,0 Q35,25 28,45 Q22,65 30,80"
              fill="none"
              stroke="url(#noodleGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-noodle-wave-2"
            />
            <path
              d="M36,0 Q30,20 38,42 Q44,62 36,80"
              fill="none"
              stroke="url(#noodleGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-noodle-wave-3"
            />
            <path
              d="M44,0 Q50,22 42,44 Q36,66 45,80"
              fill="none"
              stroke="url(#noodleGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-noodle-wave-1"
            />
          </svg>
        </div>
      </div>

      {/* Brand text with parallax */}
      <div 
        className="mt-8 text-center z-10"
        style={{
          transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
          transition: "transform 0.3s ease-out",
        }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg animate-text-glow">
          Mie Ayam Ranger
        </h1>
        <p className="text-white/80 mt-2 text-sm md:text-base animate-fade-in-up">
          Memuat rekomendasi terbaik...
        </p>
      </div>

      {/* Loading dots with enhanced animation */}
      <div className="mt-6 flex gap-3 z-10">
        <div className="w-3 h-3 rounded-full bg-white shadow-lg animate-bounce-dot" style={{ animationDelay: "0ms" }} />
        <div className="w-3 h-3 rounded-full bg-white shadow-lg animate-bounce-dot" style={{ animationDelay: "150ms" }} />
        <div className="w-3 h-3 rounded-full bg-white shadow-lg animate-bounce-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default LoadingScreen;
