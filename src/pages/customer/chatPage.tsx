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
} from "@heroui/react";
import { Send, MessageCircle } from "lucide-react";
import { socket } from "@/config/socket";
import { API_ENDPOINTS } from "@/config/api";

interface ChatPageProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  storeId: string;
  tableId: string;
}

export default function ChatPage({
  isOpen,
  onOpenChange,
  tableName,
  storeId,
  tableId,
}: ChatPageProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storeId && tableId) {
      const handleReceiveMessage = (data: {
        tableId: string;
        text: string;
        sender: "staff" | "customer";
        timestamp: string;
      }) => {
        if (data.tableId === tableId && data.sender !== "customer") {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              text: data.text,
              sender: data.sender,
              timestamp: data.timestamp,
            },
          ]);
        }
      };

      socket.on("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);

      return () => {
        socket.off("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
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
        setMessages(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();
  }, [tableId, isOpen]);

  const sendMessage = () => {
    if (!message.trim() || !storeId || !tableId) return;

    const msgData = {
      storeId,
      tableId,
      text: message,
      sender: "customer" as const,
      timestamp: new Date().toISOString(),
    };

    // Emit via socket
    socket.emit("SEND_CHAT_MESSAGE", msgData);

    // Optimistically add to local messages
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        sender: "customer",
        timestamp: new Date().toISOString(),
      },
    ]);
    setMessage("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      placement="bottom-center"
      className="m-0 sm:m-4 max-h-[80vh] fixed bottom-0 z-[100]"
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
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success animate-pulse">
                  <MessageCircle size={24} />
                </div>
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
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-default-400 mt-1.5 font-bold px-1 uppercase">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </ScrollShadow>
            </ModalBody>
            <ModalFooter className="border-t p-4 bg-white/50 backdrop-blur-sm">
              <div className="w-full flex gap-3 items-center">
                <Input
                  fullWidth
                  placeholder="ຂຽນຂໍ້ຄວາມຫາພະນັກງານ..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
