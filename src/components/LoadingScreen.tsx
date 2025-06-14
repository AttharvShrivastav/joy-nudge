
import { motion } from "framer-motion";

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-gradient-to-br from-joy-white to-joy-light-blue/20 z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Logo */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-6"
          >
            <img 
              src="/lovable-uploads/424186e2-de89-4a2a-a690-1d1d0f47bbe8.png" 
              alt="Joy Nudge Logo" 
              className="w-24 h-24 mx-auto rounded-full shadow-lg"
            />
          </motion.div>
          
          <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
            Joy Nudge
          </h1>
          <p className="text-joy-steel-blue font-lato">
            Preparing your personalized experience...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 bg-joy-coral rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
