import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/react";
import { LeftWaves, BottomWaves, EnhancedBottomWaves } from "../components/AnimatedWaves";
import HeroImage from "../assets/hero-img.png";
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="relative min-h-screen app-layout overflow-hidden">
        {/* Animated Waves */}
        {/* <LeftWaves /> */}
        {/* <BottomWaves /> */}
        <EnhancedBottomWaves />
        {/* Main content container */}
        <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between relative z-10">
          {/* Left side - Text content */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-heading mb-4">e-KYC Service</h1>
            <p className="text-muted text-lg md:text-xl mb-8 max-w-xl">
              We provide tamper-proof, highly secure e-KYC services, using Smart Contracts on the
              Ethereum Blockchain Network.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                Log In
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#323c87] flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Sign Up
              </Button>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="md:w-1/2">
            <div className="relative w-full max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
                animate={{
                  opacity: [1, 0.95, 1],
                  y: [-20, 0, -20],
                  x: [-10, 10, -10],
                  rotate: [-1, 1, -1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeatType: "reverse",
                }}
                style={{
                  display: "inline-block",
                  willChange: "transform",
                  transformOrigin: "center center",
                }}
              >
                <img src={HeroImage} className="w-full h-auto" alt="e-KYC Service Illustration" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
