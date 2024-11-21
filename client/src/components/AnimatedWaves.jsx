import { motion } from "framer-motion";

export const LeftWaves = () => {
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

export const BottomWaves = () => (
  <div className="absolute left-0 bottom-0 w-full h-64 overflow-hidden pointer-events-none">
    <motion.svg
      viewBox="0 0 1200 200"
      className="absolute w-full h-full opacity-20"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 0,100 
           C 200,100 300,30 600,30 
           C 900,30 1000,100 1200,100 
           L 1200,200 
           L 0,200 
           Z"
        fill="rgb(59, 130, 246)"
        className="opacity-50"
        animate={{
          d: [
            "M 0,100 C 200,100 300,30 600,30 C 900,30 1000,100 1200,100 L 1200,200 L 0,200 Z",
            "M 0,100 C 200,100 300,60 600,60 C 900,60 1000,100 1200,100 L 1200,200 L 0,200 Z",
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
  </div>
);

export const EnhancedBottomWaves = () => (
  <div className="absolute left-0 bottom-0 w-full h-[45vh] overflow-hidden pointer-events-none">
    {/* Back wave - slowest and highest */}
    <motion.svg
      viewBox="0 0 1200 300"
      className="absolute w-full h-full opacity-20"
      preserveAspectRatio="none"
    >
      <motion.path
        initial={{
          d: "M 0,120 C 200,120 300,40 600,40 C 900,40 1000,120 1200,120 L 1200,300 L 0,300 Z",
        }}
        animate={{
          d: [
            "M 0,120 C 200,120 300,40 600,40 C 900,40 1000,120 1200,120 L 1200,300 L 0,300 Z",
            "M 0,120 C 200,120 300,80 600,80 C 900,80 1000,120 1200,120 L 1200,300 L 0,300 Z",
          ],
        }}
        fill="rgb(59, 130, 246)"
        className="opacity-40"
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />
    </motion.svg>

    {/* Middle wave */}
    <motion.svg
      viewBox="0 0 1200 300"
      className="absolute w-full h-full opacity-25"
      preserveAspectRatio="none"
    >
      <motion.path
        initial={{
          d: "M 0,150 C 200,150 300,80 600,80 C 900,80 1000,150 1200,150 L 1200,300 L 0,300 Z",
        }}
        animate={{
          d: [
            "M 0,150 C 200,150 300,80 600,80 C 900,80 1000,150 1200,150 L 1200,300 L 0,300 Z",
            "M 0,150 C 200,150 300,120 600,120 C 900,120 1000,150 1200,150 L 1200,300 L 0,300 Z",
          ],
        }}
        fill="rgb(59, 130, 246)"
        className="opacity-50"
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />
    </motion.svg>

    {/* Front wave */}
    <motion.svg
      viewBox="0 0 1200 300"
      className="absolute w-full h-full opacity-30"
      preserveAspectRatio="none"
    >
      <motion.path
        initial={{
          d: "M 0,180 C 200,180 300,140 600,140 C 900,140 1000,180 1200,180 L 1200,300 L 0,300 Z",
        }}
        animate={{
          d: [
            "M 0,180 C 200,180 300,140 600,140 C 900,140 1000,180 1200,180 L 1200,300 L 0,300 Z",
            "M 0,180 C 200,180 300,160 600,160 C 900,160 1000,180 1200,180 L 1200,300 L 0,300 Z",
          ],
        }}
        fill="rgb(59, 130, 246)"
        className="opacity-60"
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />
    </motion.svg>

    {/* Detail wave */}
    <motion.svg
      viewBox="0 0 1200 300"
      className="absolute w-full h-full opacity-20"
      preserveAspectRatio="none"
    >
      <motion.path
        initial={{
          d: "M 0,200 C 200,200 300,180 600,180 C 900,180 1000,200 1200,200 L 1200,300 L 0,300 Z",
        }}
        animate={{
          d: [
            "M 0,200 C 200,200 300,180 600,180 C 900,180 1000,200 1200,200 L 1200,300 L 0,300 Z",
            "M 0,200 C 200,200 300,190 600,190 C 900,190 1000,200 1200,200 L 1200,300 L 0,300 Z",
          ],
        }}
        fill="rgb(59, 130, 246)"
        className="opacity-70"
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />
    </motion.svg>
  </div>
);
