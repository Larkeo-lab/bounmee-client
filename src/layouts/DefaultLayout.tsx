import { useState } from "react";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useSocketNotification } from "@/hooks/useSocket";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Connect to socket for global notifications
  useSocketNotification();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-default-50 dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
}
