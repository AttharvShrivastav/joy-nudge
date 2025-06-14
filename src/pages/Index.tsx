
import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import JoyDashboard from "@/components/JoyDashboard";

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-joy-gradient transition-all duration-300">
      {!onboarded ? (
        <Onboarding onDone={() => setOnboarded(true)} />
      ) : (
        <JoyDashboard />
      )}
    </div>
  );
};
export default Index;
