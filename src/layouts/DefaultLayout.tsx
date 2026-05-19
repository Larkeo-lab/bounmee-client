import { useState } from "react";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useSocketNotification } from "@/hooks/useSocket";
import { useAuth } from "@/routes/AuthContext";
import { useGetStoreDetail } from "@/services/store/useStore";
import ModelGlobleEnDate from "@/components/common/model-globle-enDate";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Connect to socket for global notifications
  useSocketNotification();

  // Expiry check logic
  const { user } = useAuth();
  const storeId = user?.user?.store?.id || user?.user?.storeId || "";

  const { data: storeResponse, isLoading: isStoreLoading } =
    useGetStoreDetail(storeId);
  const store = storeResponse?.data;

  // Expiry locks if: loaded, request completed, and endDate is null, undefined, or expired.
  const isExpired =
    !isStoreLoading && storeResponse
      ? !store?.endDate || new Date(store.endDate).getTime() < Date.now()
      : false;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <ModelGlobleEnDate
          isOpen={isExpired}
          onOpenChange={() => {}}
          endDate={store?.endDate}
          storeName={store?.name}
        />
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
