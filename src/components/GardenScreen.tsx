
export default function GardenScreen() {
  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Your Joy Garden
        </h1>
        <div className="joy-card p-6 text-center">
          <h2 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-3">
            Growing Soon
          </h2>
          <p className="text-joy-steel-blue font-lato mb-2">
            As you complete nudges, your virtual garden will bloom 🌱
          </p>
        </div>
      </div>
    </div>
  );
}
