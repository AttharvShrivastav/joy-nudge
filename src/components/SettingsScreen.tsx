import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Bell, Moon, Palette, User, Shield, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: true,
    quietHours: false,
    darkMode: false,
    nudgeFrequency: 'daily',
    soundEnabled: true,
  });

  useEffect(() => {
    if (user) {
      const userProfile = {
        username: user.user_metadata?.username || user.email?.split('@')[0] || "",
        email: user.email || "",
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
      };
      setProfile(userProfile);
      setForm(userProfile);
    }
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
    setForm(profile);
  };

  const handleCancel = () => setEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update auth metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
        }
      });

      if (error) throw error;

      setProfile(form);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Settings
        </h1>

        {/* Profile Section */}
        <div className="joy-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-joy-steel-blue" size={24} />
            <h2 className="font-nunito font-semibold text-joy-dark-blue text-lg">Profile</h2>
          </div>
          
          {!editing ? (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <span className="font-lato text-lg text-joy-steel-blue">Username:</span>
                <span className="font-nunito text-lg text-joy-dark-blue">{profile.username}</span>
              </div>
              <div className="mb-4 flex justify-between items-center">
                <span className="font-lato text-lg text-joy-steel-blue">Email:</span>
                <span className="font-nunito text-lg text-joy-dark-blue">{profile.email}</span>
              </div>
              {profile.first_name && (
                <div className="mb-4 flex justify-between items-center">
                  <span className="font-lato text-lg text-joy-steel-blue">First Name:</span>
                  <span className="font-nunito text-lg text-joy-dark-blue">{profile.first_name}</span>
                </div>
              )}
              {profile.last_name && (
                <div className="mb-4 flex justify-between items-center">
                  <span className="font-lato text-lg text-joy-steel-blue">Last Name:</span>
                  <span className="font-nunito text-lg text-joy-dark-blue">{profile.last_name}</span>
                </div>
              )}
              <Button onClick={handleEdit} className="joy-button-primary w-full mt-2">
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="font-lato block mb-1 text-joy-dark-blue" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="border-joy-light-blue focus:border-joy-steel-blue"
                />
              </div>
              <div className="mb-4">
                <label className="font-lato block mb-1 text-joy-dark-blue" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  disabled
                  className="border-joy-light-blue bg-gray-50"
                />
                <p className="text-xs text-joy-steel-blue mt-1">Email cannot be changed here</p>
              </div>
              <div className="mb-4">
                <label className="font-lato block mb-1 text-joy-dark-blue" htmlFor="first_name">
                  First Name
                </label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="border-joy-light-blue focus:border-joy-steel-blue"
                />
              </div>
              <div className="mb-4">
                <label className="font-lato block mb-1 text-joy-dark-blue" htmlFor="last_name">
                  Last Name
                </label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="border-joy-light-blue focus:border-joy-steel-blue"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="joy-button-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="joy-button-secondary flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Notifications Section */}
        <div className="joy-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-joy-steel-blue" size={24} />
            <h2 className="font-nunito font-semibold text-joy-dark-blue text-lg">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-lato font-medium text-joy-dark-blue">Daily Nudges</div>
                <div className="text-sm text-joy-steel-blue">Receive gentle reminders</div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="font-lato font-medium text-joy-dark-blue">Quiet Hours</div>
                <div className="text-sm text-joy-steel-blue">No notifications 9PM - 8AM</div>
              </div>
              <Switch
                checked={settings.quietHours}
                onCheckedChange={(checked) => handleSettingChange('quietHours', checked)}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="font-lato font-medium text-joy-dark-blue">Sound</div>
                <div className="text-sm text-joy-steel-blue">Play notification sounds</div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="joy-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-joy-steel-blue" size={24} />
            <h2 className="font-nunito font-semibold text-joy-dark-blue text-lg">Appearance</h2>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="font-lato font-medium text-joy-dark-blue">Dark Mode</div>
              <div className="text-sm text-joy-steel-blue">Coming soon</div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              disabled
            />
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="joy-card p-6 mb-6">
          <Button 
            onClick={handleSignOut}
            className="w-full bg-joy-coral hover:bg-joy-coral/80 text-white font-nunito font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Sign Out
          </Button>
        </div>

        {/* About Section */}
        <div className="joy-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-joy-steel-blue" size={24} />
            <h2 className="font-nunito font-semibold text-joy-dark-blue text-lg">About</h2>
          </div>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-joy-light-blue/20 hover:bg-joy-light-blue/30 transition-colors">
              <div className="font-lato font-medium text-joy-dark-blue">Privacy Policy</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-joy-light-blue/20 hover:bg-joy-light-blue/30 transition-colors">
              <div className="font-lato font-medium text-joy-dark-blue">Terms of Service</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-joy-light-blue/20 hover:bg-joy-light-blue/30 transition-colors">
              <div className="font-lato font-medium text-joy-dark-blue">Contact Support</div>
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-joy-light-blue/30 text-center">
            <div className="text-sm text-joy-steel-blue font-lato">
              Joy Nudge v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
