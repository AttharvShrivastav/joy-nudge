
import { useState } from 'react';
import { motion } from 'framer-motion';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    setMessage('Password reset link sent! Check your email.');
    setTimeout(() => onBack(), 2000);
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
        </div>

        {message && (
          <div className="text-joy-steel-blue bg-joy-steel-blue/10 border-2 border-joy-steel-blue/30 p-3 rounded-xl font-lato text-sm">
            {message}
          </div>
        )}

        <motion.button
          type="submit"
          className="w-full joy-button-primary py-3 font-nunito font-semibold"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
        >
          Send Reset Link
        </motion.button>
      </form>

      <motion.button
        type="button"
        onClick={onBack}
        className="w-full text-joy-steel-blue font-lato hover:text-joy-dark-blue transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Back to sign in
      </motion.button>
    </motion.div>
  );
}
