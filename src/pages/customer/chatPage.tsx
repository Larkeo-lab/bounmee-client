import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ScrollShadow,
  Image,
} from "@heroui/react";
import { Send, MessageCircle, Clock, Check, CheckCheck } from "lucide-react";
import { socket } from "@/config/socket";
import { API_ENDPOINTS } from "@/config/api";
import { getDisplayImageUrl } from "@/lib/utils";

interface ChatPageProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  storeId: string;
  tableId: string;
  logoUrl?: string;
}

export default function ChatPage({
  isOpen,
  onOpenChange,
  tableName,
  storeId,
  tableId,
  logoUrl,
}: ChatPageProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isStaffTyping, setIsStaffTyping] = useState(false);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(offset > 0 ? offset : 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
      return () => {
        window.visualViewport?.removeEventListener("resize", handleResize);
        window.visualViewport?.removeEventListener("scroll", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (storeId && tableId) {
      const handleReceiveMessage = (data: {
        tableId: string;
        text: string;
        sender: "staff" | "customer";
        timestamp: string;
        id?: string;
      }) => {
        if (data.tableId === tableId && data.sender !== "customer") {
          setMessages((prev) => {
            if (prev.some(m => m.id === data.id)) return prev;
            return [
              ...prev,
              {
                id: data.id || Date.now() + Math.random(),
                text: data.text,
                sender: data.sender,
                timestamp: data.timestamp,
                isRead: isOpenRef.current,
              },
            ];
          });
          setIsStaffTyping(false); // clear typing flag

          if (data.id) {
            if (isOpenRef.current) {
              socket.emit("MESSAGE_READ", { storeId, tableId, messageId: data.id, senderToMarkAsRead: "staff" });
            } else {
              socket.emit("MESSAGE_DELIVERED", { storeId, tableId, messageId: data.id });
            }
          }
        }
      };

      const handleTyping = (data: { tableId: string, sender: string, isTyping: boolean }) => {
        if (data.tableId === tableId && data.sender === "staff") {
          setIsStaffTyping(data.isTyping);
        }
      };

      const handleDelivered = (data: { messageId?: string, tableId: string }) => {
        if (data.tableId === tableId) {
          setMessages((prev) => prev.map(m => 
            (m.sender === "customer" && (m.status === "sending" || m.status === "sent")) ? { ...m, status: "delivered" } : m
          ));
        }
      };

      const handleRead = (data: { messageId?: string, tableId: string, senderToMarkAsRead?: string }) => {
        if (data.tableId === tableId) {
          setMessages((prev) => prev.map(m => 
            (m.sender === "customer" && m.status !== "read") ? { ...m, status: "read" } : m
          ));
        }
      };

      socket.on("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
      socket.on("USER_TYPING", handleTyping);
      socket.on("MESSAGE_DELIVERED", handleDelivered);
      socket.on("MESSAGE_READ", handleRead);

      return () => {
        socket.off("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
        socket.off("USER_TYPING", handleTyping);
        socket.off("MESSAGE_DELIVERED", handleDelivered);
        socket.off("MESSAGE_READ", handleRead);
      };
    }
  }, [storeId, tableId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!tableId || !isOpen) return;
      try {
        const res = await axiosInstance.get(
          API_ENDPOINTS.CHAT.HISTORY(tableId),
        );
        const mappedHistory = (res.data?.data || []).map((m: any) => ({
          ...m,
          status: m.isRead ? "read" : "sent"
        }));
        setMessages(mappedHistory);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();
  }, [tableId, isOpen]);

  const sendMessage = () => {
    if (!message.trim() || !storeId || !tableId) return;

    const tempId = "temp-" + Date.now();
    const msgData = {
      id: tempId,
      storeId,
      tableId,
      text: message,
      sender: "customer" as const,
      timestamp: new Date().toISOString(),
      status: "sending"
    };

    // Optimistically add to local messages
    setMessages((prev) => [
      ...prev,
      msgData,
    ]);
    setMessage("");

    // Emit via socket
    socket.emit("SEND_CHAT_MESSAGE", msgData, (res: any) => {
      if (res.success) {
        setMessages((prev) => prev.map(m => 
          m.id === tempId ? { ...m, id: res.message.id, status: "sent" } : m
        ));
      }
    });

    // Clear typing when message is sent
    socket.emit("TYPING", {
      storeId,
      tableId,
      sender: "customer",
      isTyping: false,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (val: string) => {
    setMessage(val);

    if (!storeId || !tableId) return;

    socket.emit("TYPING", {
      storeId,
      tableId,
      sender: "customer",
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("TYPING", {
        storeId,
        tableId,
        sender: "customer",
        isTyping: false,
      });
    }, 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen, keyboardHeight, isStaffTyping]);

  // Mark messages as read when modal opens
  useEffect(() => {
    if (isOpen && storeId && tableId) {
      socket.emit("MESSAGE_READ", { storeId, tableId, senderToMarkAsRead: "staff" });
      setMessages(prev => prev.map(m => m.sender === "staff" ? { ...m, isRead: true } : m));
    }
  }, [isOpen, storeId, tableId]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      placement="bottom-center"
      className="m-0 sm:m-4 max-h-[90vh] fixed bottom-0 left-0 right-0 mx-auto z-[100] transition-[bottom] duration-200"
      style={{ bottom: keyboardHeight }}
      scrollBehavior="inside"
      backdrop="blur"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: 100,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent className="bg-white/95 backdrop-blur-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/20 shadow-2xl overflow-hidden">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b py-4 bg-white/50 text-left">
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <Image
                    src={getDisplayImageUrl(logoUrl)}
                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-default-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success animate-pulse">
                    <MessageCircle size={24} />
                  </div>
                )}
                <div className="text-left">
                  <h3 className="text-lg font-black text-default-900 tracking-tight">
                    ຕິດຕໍ່ພະນັກງານ
                  </h3>
                  <p className="text-[10px] text-default-500 font-bold uppercase tracking-widest text-left">
                    Table: {tableName}
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-0 bg-transparent">
              <ScrollShadow
                className="h-[400px] p-4 flex flex-col gap-4 no-scrollbar"
                ref={scrollRef}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10 scale-90">
                    <div className="w-24 h-24 rounded-full bg-default-100 flex items-center justify-center mb-6 shadow-inner">
                      <MessageCircle size={48} className="text-default-400" />
                    </div>
                    <p className="text-base font-black text-default-600 mb-1 line-clamp-1">
                      ເລີ່ມການສົນທະນາຂອງທ່ານ
                    </p>
                    <p className="text-xs text-default-400 max-w-[200px] leading-relaxed line-clamp-2">
                      ທ່ານສາມາດສົ່ງຂໍ້ຄວາມເພື່ອຕິດຕໍ່ພະນັກງານໄດ້ທີ່ນີ້
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "customer" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-semibold shadow-sm ${
                          msg.sender === "customer"
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-white text-default-900 rounded-bl-none border border-default-100"
                        }`}
                      >
                        <span className="leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-1.5 px-1 py-0.5">
                        {(!msg.sender || (msg.sender === "customer" && msg.status !== "sending")) && <Clock size={9} className="text-default-400" />}
                        <span className="text-[9px] text-default-400 font-bold uppercase tracking-wider">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.sender === "customer" && (
                          <span className="ml-1 flex items-center pr-1">
                            {msg.status === "sending" && <Clock size={10} className="text-default-400 opacity-60" />}
                            {msg.status === "sent" && <Check size={12} className="text-default-500" />}
                            {msg.status === "delivered" && <CheckCheck size={12} className="text-default-500" />}
                            {msg.status === "read" && <CheckCheck size={12} className="text-blue-500" />}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {isStaffTyping && (
                  <div className="flex flex-col items-start mb-2 mt-1 animate-appearance-in">
                    <div className="p-3.5 text-[15px] shadow-sm relative bg-white text-default-800 rounded-2xl rounded-bl-none border border-default-100 flex items-center justify-center gap-1.5 h-[46px] ml-1">
                      <span className="w-1.5 h-1.5 bg-default-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-default-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-default-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                    <span className="text-[10px] text-default-400 mt-1 font-medium ml-1">
                      ພະນັກງານກຳລັງພິມ...
                    </span>
                  </div>
                )}
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="border-t p-4 bg-white/50 backdrop-blur-sm">
              <div className="w-full flex gap-3 items-center">
                <Input
                  fullWidth
                  placeholder="ຂຽນຂໍ້ຄວາມຫາພະນັກງານ..."
                  value={message}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="bg-white/80"
                  size="lg"
                  radius="full"
                  classNames={{
                    input: "text-sm font-semibold",
                    innerWrapper: "pb-0.5",
                  }}
                />
                <Button
                  isIconOnly
                  color="primary"
                  radius="full"
                  onPress={sendMessage}
                  className="min-w-[50px] w-[50px] h-[50px] shadow-lg shadow-primary/30"
                >
                  <Send size={22} className="ml-1" />
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
