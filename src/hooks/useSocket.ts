import { useEffect } from "react";
import { socket } from "@/config/socket";
import { useAuth } from "@/routes/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export const useSocketNotification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const authDataJson = JSON.parse(localStorage.getItem("authPOS") || "{}");

  useEffect(() => {
    const serviceCenterId = authDataJson?.officerProfile?.serviceCenterId;
    if (!serviceCenterId) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join the room for this service center
    socket.emit("SETUP", { serviceCenterId });

    const handleQueueCreated = () => {
      // Invalidate the queues query to refresh anyone looking at queue lists
      queryClient.invalidateQueries({ queryKey: ["queues"] });
    };

    // Listen for new queue creation
    socket.on("QUEUE_CREATED", handleQueueCreated);

    // Error handling
    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    return () => {
      // socket.off("QUEUE_CREATED", handleQueueCreated);
      // socket.off("connect_error");
    };
  }, [user, queryClient]);

  return null;
};
