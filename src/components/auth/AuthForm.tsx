
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
  onShowForgotPassword: () => void;
}

export default function AuthForm({ isSignUp, onToggleMode, onShowForgotPassword }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Looks like you already have an account! Try signing in instead.');
          } else if (error.message.includes('Password')) {
            setError('Please choose a stronger password (at least 6 characters).');
          } else if (error.message.includes('email')) {
            setError('Oops, that email doesn\'t look right. Please double-check!');
          } else {
            setError('Something went wrong. Let\'s try that again!');
          }
        } else {
          setError('Welcome to Joy Nudge! Check your email for the confirmation link.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Hmm, those details don\'t match. Double-check your email and password!');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link first!');
          } else {
            setError('Something went wrong. Let\'s try that again!');
          }
        }
      }
    } catch (err) {
      setError('Something unexpected happened. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <AnimatePresence>
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
              Username
            </label>
            <motion.input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-all duration-200 font-lato focus:shadow-lg focus:shadow-joy-steel-blue/20"
              placeholder="Choose a username"
              whileFocus={{ scale: 1.01 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div variants={itemVariants}>
        <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
          Email
        </label>
        <motion.input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-all duration-200 font-lato focus:shadow-lg focus:shadow-joy-steel-blue/20"
          placeholder="Enter your email"
          whileFocus={{ scale: 1.01 }}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
          Password
        </label>
        <motion.input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-all duration-200 font-lato focus:shadow-lg focus:shadow-joy-steel-blue/20"
          placeholder="Enter your password"
          whileFocus={{ scale: 1.01 }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`font-lato text-sm p-3 rounded-xl border-2 ${
              error.includes('Welcome') || error.includes('Check your email') 
                ? 'text-joy-steel-blue bg-joy-steel-blue/10 border-joy-steel-blue/30' 
                : 'text-joy-coral bg-joy-coral/10 border-joy-coral/30'
            }`}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full joy-button-primary py-3 font-nunito font-semibold disabled:opacity-50 relative overflow-hidden"
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <motion.span
          animate={loading ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Join Joy Nudge' : 'Sign In')}
        </motion.span>
      </motion.button>

      <div className="text-center space-y-3">
        <motion.button
          type="button"
          onClick={onToggleMode}
          className="text-joy-coral font-lato hover:text-joy-dark-blue transition-colors font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </motion.button>
        
        {!isSignUp && (
          <motion.button
            type="button"
            onClick={onShowForgotPassword}
            className="block w-full text-joy-steel-blue font-lato hover:text-joy-dark-blue transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Forgot your password?
          </motion.button>
        )}
      </div>
    </motion.form>
  );
}
