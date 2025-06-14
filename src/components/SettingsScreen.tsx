
export default function SettingsScreen() {
  return (
    <div className="min-h-screen bg-joy-gradient pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Settings
        </h1>
        
        <div className="space-y-4">
          {['Profile', 'Notifications', 'Subscription', 'About'].map((item) => (
            <div key={item} className="joy-card p-4">
              <span className="font-lato text-joy-dark-blue">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
