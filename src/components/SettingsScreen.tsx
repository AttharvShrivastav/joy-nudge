
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Bell, Moon, Palette, User, Shield, Heart } from "lucide-react";

export default function SettingsScreen() {
  const [profile, setProfile] = useState({
    name: "Your Name",
    email: "your@email.com",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  
  const [settings, setSettings] = useState({
    notifications: true,
    quietHours: false,
    darkMode: false,
    nudgeFrequency: 'daily',
    soundEnabled: true,
  });

  const handleEdit = () => {
    setEditing(true);
    setForm(profile);
  };

  const handleCancel = () => setEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(form);
    setEditing(false);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
                <div><span className="font-lato text-lg">Name:</span></div>
                <div className="font-nunito text-lg">{profile.name}</div>
              </div>
              <div className="mb-4 flex justify-between items-center">
                <div><span className="font-lato text-lg">Email:</span></div>
                <div className="font-nunito text-lg">{profile.email}</div>
              </div>
              <Button onClick={handleEdit} className="joy-button-primary w-full mt-2">
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="font-lato block mb-1" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mb-2"
                />
              </div>
              <div className="mb-4">
                <label className="font-lato block mb-1" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="joy-button-primary flex-1">
                  Save
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
