import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { socket } from "@/config/socket";
import { useAuth } from "@/routes/AuthContext";
import { axiosInstance } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

interface Message {
  id: string | number;
  tableId: string;
  storeId?: string;
  text: string;
  sender: "staff" | "customer";
  timestamp: string;
}

interface ChatContextType {
  unreadCounts: { [tableId: string]: number };
  lastMessages: { [tableId: string]: Message };
  refreshChatData: () => Promise<void>;
  markAsRead: (tableId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storeId = user?.user?.storeId;
  const [unreadCounts, setUnreadCounts] = useState<{ [tableId: string]: number }>({});
  const [lastMessages, setLastMessages] = useState<{ [tableId: string]: Message }>({});

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/assets/void/pop_ding.mp3");
      audio.play().catch((err) => console.log("Audio play error:", err));
    } catch (err) {
      console.log("Audio creation error:", err);
    }
  }, []);

  const refreshChatData = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.CHAT.UNREAD(storeId));
      const data = res.data?.data;
      if (data) {
        setUnreadCounts(data.unreadCounts || {});
        setLastMessages(data.lastMessages || {});
      }
    } catch (err) {
      console.error("Failed to fetch unread counts:", err);
    }
  }, [storeId]);

  const markAsRead = useCallback(async (tableId: string) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.CHAT.READ(tableId));
      setUnreadCounts(prev => ({ ...prev, [tableId]: 0 }));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, []);

  useEffect(() => {
    if (storeId) {
      if (!socket.connected) socket.connect();
      socket.emit("JOIN:STORE", storeId);

      const handleReceiveMessage = (data: Message) => {
        if (data.sender === "staff") return;
        
        playNotificationSound();
        refreshChatData(); // Refresh everything to keep it synced
      };

      const handleUnreadUpdate = () => {
        refreshChatData();
      };

      socket.on("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
      socket.on("CHAT_UNREAD_COUNT_UPDATE", handleUnreadUpdate);
      
      refreshChatData();

      return () => {
        socket.off("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
        socket.off("CHAT_UNREAD_COUNT_UPDATE", handleUnreadUpdate);
      };
    }
  }, [storeId, refreshChatData, playNotificationSound]);

  return (
    <ChatContext.Provider value={{ unreadCounts, lastMessages, refreshChatData, markAsRead }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
