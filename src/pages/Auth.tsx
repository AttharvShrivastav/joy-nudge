
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JoyIcon from '@/components/JoyIcon';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-joy-white via-joy-light-blue/20 to-joy-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-joy-light-blue/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-joy-coral/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-joy-steel-blue/10 rounded-full blur-xl"></div>
      </div>

      <motion.div 
        className="joy-card w-full max-w-md p-8 relative backdrop-blur-sm border-2 border-joy-light-blue/30"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div 
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <JoyIcon size={60} />
          </motion.div>
          <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
            {isSignUp ? 'Join Joy Nudge' : 'Welcome Back'}
          </h1>
          <p className="text-joy-steel-blue font-lato">
            {isSignUp ? 'Start your mindfulness journey' : 'Continue your practice'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showForgotPassword ? (
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              key="main-form"
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
            </motion.form>
          ) : (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-2">
                  Reset Password
                </h2>
                <p className="text-joy-steel-blue font-lato text-sm">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>
              
              <div>
                <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
                  Email
                </label>
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-all duration-200 font-lato focus:shadow-lg focus:shadow-joy-steel-blue/20"
                  placeholder="Enter your email"
                  whileFocus={{ scale: 1.01 }}
                />
              </div>

              <motion.button
                type="button"
                className="w-full joy-button-primary py-3 font-nunito font-semibold"
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={() => {
                  // Handle password reset logic here
                  setError('Password reset link sent! Check your email.');
                  setTimeout(() => setShowForgotPassword(false), 2000);
                }}
              >
                Send Reset Link
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="mt-6 text-center space-y-3" variants={itemVariants}>
          {!showForgotPassword && (
            <>
              <motion.button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-joy-coral font-lato hover:text-joy-dark-blue transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </motion.button>
              
              {!isSignUp && (
                <motion.button
                  onClick={() => setShowForgotPassword(true)}
                  className="block w-full text-joy-steel-blue font-lato hover:text-joy-dark-blue transition-colors text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Forgot your password?
                </motion.button>
              )}
            </>
          )}
          
          {showForgotPassword && (
            <motion.button
              onClick={() => setShowForgotPassword(false)}
              className="text-joy-steel-blue font-lato hover:text-joy-dark-blue transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to sign in
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
