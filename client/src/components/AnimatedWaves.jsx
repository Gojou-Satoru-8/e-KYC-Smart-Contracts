import { motion } from "framer-motion";

const AnimatedWaves = () => {
  return (
    <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
      {/* First wave layer */}
      <motion.svg
        viewBox="0 0 100 800"
        className="absolute h-full w-full opacity-20"
        preserveAspectRatio="none"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{
          repeat: Infinity,
          duration: 15,
          ease: "linear",
        }}
      >
        <motion.path
          d="M0,-100 
           C20,0 0,100 30,200 
           C60,300 30,400 60,500 
           C90,600 60,700 90,800"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="8"
          className="opacity-50"
          animate={{
            d: [
              "M0,-100 C20,0 0,100 30,200 C60,300 30,400 60,500 C90,600 60,700 90,800",
              "M-30,-100 C0,0 -20,100 10,200 C40,300 10,400 40,500 C70,600 40,700 70,800",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />
      </motion.svg>

      {/* Second wave layer */}
      <motion.svg
        viewBox="0 0 100 800"
        className="absolute h-full w-full opacity-30"
        preserveAspectRatio="none"
        initial={{ x: -80 }}
        animate={{ x: 0 }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "linear",
        }}
      >
        <motion.path
          d="M30,-100 
           C50,0 30,100 60,200 
           C90,300 60,400 90,500 
           C120,600 90,700 120,800"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="8"
          className="opacity-60"
          animate={{
            d: [
              "M30,-100 C50,0 30,100 60,200 C90,300 60,400 90,500 C120,600 90,700 120,800",
              "M0,-100 C30,0 10,100 40,200 C70,300 40,400 70,500 C100,600 70,700 100,800",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />
      </motion.svg>

      {/* Third wave layer */}
      <motion.svg
        viewBox="0 0 100 800"
        className="absolute h-full w-full opacity-25"
        preserveAspectRatio="none"
        initial={{ x: -60 }}
        animate={{ x: 0 }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
      >
        <motion.path
          d="M-30,-100 
           C0,0 -20,100 10,200 
           C40,300 10,400 40,500 
           C70,600 40,700 70,800"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="8"
          className="opacity-70"
          animate={{
            d: [
              "M-30,-100 C0,0 -20,100 10,200 C40,300 10,400 40,500 C70,600 40,700 70,800",
              "M-60,-100 C-30,0 -50,100 -20,200 C10,300 -20,400 10,500 C40,600 10,700 40,800",
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />
      </motion.svg>
    </div>
  );
};

export default AnimatedWaves;
