import { useState, useEffect } from "react";
import { socket } from "@/config/socket";

export const useWifiConnect = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [rtt, setRtt] = useState<number | null>(null);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => {
      setIsConnected(false);
      setRtt(null);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    const checkLatency = () => {
      if (!socket.connected) return;
      const start = performance.now();
      
      // Use navigator.connection if available as a hint, or ping the server
      if ((navigator as any).connection?.rtt !== undefined) {
        setRtt((navigator as any).connection.rtt);
      } else {
        socket.emit("PING", () => {
          setRtt(Math.round(performance.now() - start));
        });
      }
    };

    checkLatency();
    const interval = setInterval(checkLatency, 10000);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      clearInterval(interval);
    };
  }, []);

  return { isConnected, rtt };
};
