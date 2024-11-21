import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/react";
import Header from "../components/Header";
import AnimatedWaves from "../components/AnimatedWaves";
import HeroImage from "../assets/hero-img.png";
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="relative min-h-screen app-layout overflow-hidden">
        {/* Animated Waves */}
        {/* <div className="absolute left-0 top-0 h-full w-1/3 overflow-hidden pointer-events-none">
          <motion.svg
            viewBox="0 0 100 800"
            className="absolute h-full w-full opacity-10"
            preserveAspectRatio="none"
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }}
          >
            <motion.path
              d="M0,800 C20,750 40,700 50,650 C60,600 80,550 100,500 C120,450 140,400 150,350 C160,300 180,250 200,200 C220,150 240,100 250,50 C260,0 280,-50 300,-100"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              className="opacity-30"
              animate={{
                d: [
                  "M0,800 C20,750 40,700 50,650 C60,600 80,550 100,500 C120,450 140,400 150,350 C160,300 180,250 200,200 C220,150 240,100 250,50 C260,0 280,-50 300,-100",
                  "M-50,800 C-30,750 -10,700 0,650 C10,600 30,550 50,500 C70,450 90,400 100,350 C110,300 130,250 150,200 C170,150 190,100 200,50 C210,0 230,-50 250,-100",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 10,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
            />
          </motion.svg>

          <motion.svg
            viewBox="0 0 100 800"
            className="absolute h-full w-full opacity-20"
            preserveAspectRatio="none"
            initial={{ x: -30 }}
            animate={{ x: 0 }}
            transition={{
              repeat: Infinity,
              duration: 15,
              ease: "linear",
            }}
          >
            <motion.path
              d="M-100,800 C-80,750 -60,700 -50,650 C-40,600 -20,550 0,500 C20,450 40,400 50,350 C60,300 80,250 100,200 C120,150 140,100 150,50 C160,0 180,-50 200,-100"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              className="opacity-40"
              animate={{
                d: [
                  "M-100,800 C-80,750 -60,700 -50,650 C-40,600 -20,550 0,500 C20,450 40,400 50,350 C60,300 80,250 100,200 C120,150 140,100 150,50 C160,0 180,-50 200,-100",
                  "M-150,800 C-130,750 -110,700 -100,650 C-90,600 -70,550 -50,500 C-30,450 -10,400 0,350 C10,300 30,250 50,200 C70,150 90,100 100,50 C110,0 130,-50 150,-100",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut",
                repeatType: "reverse",
              }}
            />
          </motion.svg>
        </div> */}
        <AnimatedWaves />
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
