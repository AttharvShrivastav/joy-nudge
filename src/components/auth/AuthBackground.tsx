
export default function AuthBackground() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-joy-white via-joy-light-blue/20 to-joy-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-joy-light-blue/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-joy-coral/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-joy-steel-blue/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
