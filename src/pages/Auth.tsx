
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
          setError(error.message);
        } else {
          setError('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-joy-white flex items-center justify-center p-6">
      <div className="joy-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
            {isSignUp ? 'Join Joy Nudge' : 'Welcome Back'}
          </h1>
          <p className="text-joy-steel-blue font-lato">
            {isSignUp ? 'Start your mindfulness journey' : 'Continue your practice'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-colors font-lato"
                placeholder="Choose a username"
              />
            </div>
          )}
          
          <div>
            <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-colors font-lato"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-joy-light-blue rounded-xl focus:border-joy-steel-blue focus:outline-none transition-colors font-lato"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-joy-coral font-lato text-sm bg-joy-coral/10 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full joy-button-primary py-3 font-nunito font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-joy-coral font-lato hover:text-joy-dark-blue transition-colors font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
