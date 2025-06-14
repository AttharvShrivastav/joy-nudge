
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthBackground from '@/components/auth/AuthBackground';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthForm from '@/components/auth/AuthForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <AuthBackground>
      <motion.div 
        className="joy-card w-full max-w-md p-8 relative backdrop-blur-sm border-2 border-joy-light-blue/30"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AuthHeader isSignUp={isSignUp} />

        <AnimatePresence mode="wait">
          {!showForgotPassword ? (
            <AuthForm
              key="main-form"
              isSignUp={isSignUp}
              onToggleMode={() => setIsSignUp(!isSignUp)}
              onShowForgotPassword={() => setShowForgotPassword(true)}
            />
          ) : (
            <ForgotPasswordForm
              key="forgot-password"
              onBack={() => setShowForgotPassword(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AuthBackground>
  );
}
