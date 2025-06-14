
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function SettingsScreen() {
  const [profile, setProfile] = useState({
    name: "Your Name",
    email: "your@email.com",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

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

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Settings
        </h1>
        <div className="joy-card p-6">
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
        {/* More settings (notifications, subscription etc) can be added below */}
      </div>
    </div>
  );
}
