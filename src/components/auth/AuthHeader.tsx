
import { motion } from 'framer-motion';

interface AuthHeaderProps {
  isSignUp: boolean;
}

export default function AuthHeader({ isSignUp }: AuthHeaderProps) {
  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div 
        className="flex justify-center mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <img 
          src="/lovable-uploads/827da81c-1b3f-4ca6-9231-7d5660105e45.png" 
          alt="Joy Nudge Mascot" 
          className="w-20 h-20 drop-shadow"
        />
      </motion.div>
      <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
        {isSignUp ? 'Join Joy Nudge' : 'Welcome Back'}
      </h1>
      <p className="text-joy-steel-blue font-lato">
        {isSignUp ? 'Start your mindfulness journey' : 'Continue your practice'}
      </p>
    </motion.div>
  );
}
