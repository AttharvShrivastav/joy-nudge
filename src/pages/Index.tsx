import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import JoyDashboard from "@/components/JoyDashboard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);

  if (!onboarded) {
    // Onboarding stays fullscreen.
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-joy-gradient transition-all duration-300">
        <Onboarding onDone={() => setOnboarded(true)} />
      </div>
    );
  }

  // After onboarding, show sidebar + dashboard.
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-joy-gradient">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <SidebarTrigger className="fixed top-4 left-4 z-30" />
          <JoyDashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};
export default Index;
