import { useState, useEffect, useRef, useMemo } from "react";
import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@/routes/AuthContext";
import { useGetTables, TableItem } from "@/services/table/useTable";
import {
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  ScrollShadow,
  Divider,
} from "@heroui/react";
import {
  Send,
  Search,
  MessageCircle,
  User,
  Hash,
  Clock,
  MoreVertical,
  LayoutGrid,
  Check,
  CheckCheck,
} from "lucide-react";
import { socket } from "@/config/socket";
import { API_ENDPOINTS } from "@/config/api";
import { useChat } from "@/contexts/ChatContext";

interface Message {
  id: string | number;
  tableId: string;
  storeId?: string;
  text: string;
  sender: "staff" | "customer";
  timestamp: string;
  isRead?: boolean;
  status?: "sending" | "sent" | "delivered" | "read";
}

export default function ChatPage() {
  const { user } = useAuth();
  const { unreadCounts, lastMessages, markAsRead } = useChat();
  const storeId = user?.user?.storeId;
  const { data: tablesResponse, isLoading: isLoadingTables } =
    useGetTables(storeId);
  const tables = tablesResponse?.data || [];

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ [tableId: string]: Message[] }>(
    {},
  );
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [typingStatus, setTypingStatus] = useState<{ [tableId: string]: boolean }>({});
  const selectedTableIdRef = useRef<string | null>(selectedTableId);

  useEffect(() => {
    selectedTableIdRef.current = selectedTableId;
  }, [selectedTableId]);

  // Hook into socket for live MESSAGE display in the active chat window
  useEffect(() => {
    if (storeId) {
      const handleReceiveMessage = (data: Message) => {
        setMessages((prev) => {
          const tableMsgs = prev[data.tableId] || [];
          if (tableMsgs.some(m => m.id === data.id)) return prev;

          return {
            ...prev,
            [data.tableId]: [
              ...tableMsgs,
              { ...data, status: data.isRead ? "read" : "sent" },
            ],
          };
        });
        
        // When receiving a message, they clearly stopped typing
        setTypingStatus((prev) => ({ ...prev, [data.tableId]: false }));

        if (data.sender === "customer") {
          if (selectedTableIdRef.current === data.tableId) {
            socket.emit("MESSAGE_READ", { storeId, tableId: data.tableId, messageId: data.id, senderToMarkAsRead: "customer" });
          } else {
            socket.emit("MESSAGE_DELIVERED", { storeId, tableId: data.tableId, messageId: data.id });
          }
        }
      };

      const handleTyping = (data: { tableId: string, sender: string, isTyping: boolean }) => {
        if (data.sender === "staff") return;
        setTypingStatus((prev) => ({
          ...prev,
          [data.tableId]: data.isTyping,
        }));
      };

      const handleDelivered = (data: { messageId?: string, tableId: string }) => {
        setMessages((prev) => {
          const tableMsgs = prev[data.tableId] || [];
          return {
            ...prev,
            [data.tableId]: tableMsgs.map(m => 
              (m.sender === "staff" && (m.status === "sent" || m.status === "sending")) ? { ...m, status: "delivered" } : m
            )
          };
        });
      };

      const handleRead = (data: { messageId?: string, tableId: string, senderToMarkAsRead?: string }) => {
        setMessages((prev) => {
          const tableMsgs = prev[data.tableId] || [];
          return {
            ...prev,
            [data.tableId]: tableMsgs.map(m => 
              (m.sender === "staff" && m.status !== "read") ? { ...m, status: "read" } : m
            )
          };
        });
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
  }, [storeId, selectedTableId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedTableId) return;
      try {
        const res = await axiosInstance.get(
          API_ENDPOINTS.CHAT.HISTORY(selectedTableId),
        );
        const mappedHistory = (res.data?.data || []).map((m: any) => ({
          ...m,
          status: m.isRead ? "read" : "sent"
        }));
        setMessages((prev) => ({
          ...prev,
          [selectedTableId]: mappedHistory,
        }));

        // Send read receipt for all unread customer messages
        if (storeId) {
          socket.emit("MESSAGE_READ", { storeId, tableId: selectedTableId, senderToMarkAsRead: "customer" });
        }

        // Mark as read globally
        markAsRead(selectedTableId);
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchHistory();
  }, [selectedTableId, markAsRead]);

  const selectedTable = useMemo(
    () => tables.find((t: TableItem) => t.id === selectedTableId),
    [tables, selectedTableId],
  );

  const filteredTables = useMemo(() => {
    return [...tables]
      .filter((t: TableItem) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        const lastA =
          (messages[a.id] || [])[(messages[a.id] || []).length - 1] ||
          lastMessages[a.id];
        const lastB =
          (messages[b.id] || [])[(messages[b.id] || []).length - 1] ||
          lastMessages[b.id];

        const timeA = lastA ? new Date(lastA.timestamp).getTime() : 0;
        const timeB = lastB ? new Date(lastB.timestamp).getTime() : 0;

        return timeB - timeA;
      });
  }, [tables, searchQuery, messages, lastMessages]);

  const currentMessages = useMemo(() => {
    const tableMsgs = selectedTableId ? messages[selectedTableId] : [];
    return Array.isArray(tableMsgs) ? tableMsgs : [];
  }, [messages, selectedTableId]);

  const sendMessage = () => {
    if (!inputText.trim() || !selectedTableId || !storeId) return;

    const tempId = "temp-" + Date.now();
    const msgData: Message = {
      id: tempId,
      storeId,
      tableId: selectedTableId,
      text: inputText,
      sender: "staff",
      timestamp: new Date().toISOString(),
      status: "sending"
    };

    setMessages((prev) => ({
      ...prev,
      [selectedTableId]: [
        ...(prev[selectedTableId] || []),
        msgData,
      ],
    }));
    setInputText("");

    socket.emit("SEND_CHAT_MESSAGE", msgData, (res: any) => {
      if (res.success) {
        setMessages((prev) => ({
          ...prev,
          [selectedTableId]: (prev[selectedTableId] || []).map(m => 
            m.id === tempId ? { ...m, id: res.message.id, status: m.status === "sending" ? "sent" : m.status } : m
          )
        }));
      }
    });
    
    // Clear typing status when message is sent
    socket.emit("TYPING", {
      storeId,
      tableId: selectedTableId,
      sender: "staff",
      isTyping: false,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (val: string) => {
    setInputText(val);

    if (!selectedTableId || !storeId) return;

    socket.emit("TYPING", {
      storeId,
      tableId: selectedTableId,
      sender: "staff",
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("TYPING", {
        storeId,
        tableId: selectedTableId,
        sender: "staff",
        isTyping: false,
      });
    }, 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  if (isLoadingTables) return null;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4 m-4">
      {/* Sidebar: Table List */}
      <Card className="w-80 h-full border-none shadow-medium bg-background/60 backdrop-blur-xl">
        <CardBody className="p-0 flex flex-col">
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                <MessageCircle size={28} className="text-primary" />
                ສົນທະນາ
              </h2>
            </div>
            <Input
              placeholder="ຄົ້ນຫາໂຕະ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search size={18} className="text-default-400" />}
              radius="full"
              variant="faded"
              classNames={{
                inputWrapper:
                  "bg-default-100/50 hover:bg-default-200/50 transition-colors border-none",
              }}
            />
          </div>
          <Divider className="opacity-50" />
          <ScrollShadow className="flex-grow p-3">
            <div className="flex flex-col gap-2">
              {filteredTables.map((table: TableItem) => {
                const isSelected = selectedTableId === table.id;
                const unreadCount = unreadCounts[table.id] || 0;
                const lastMsg =
                  (messages[table.id] || [])[
                    (messages[table.id] || []).length - 1
                  ] || lastMessages[table.id];

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`group w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? "bg-primary text-white shadow-md  scale-[1.02]"
                        : "hover:bg-default-100/80 text-default-700 hover:scale-[1.01]"
                    }`}
                  >
                    <Avatar
                      icon={<User size={20} />}
                      className={`transition-colors duration-300 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary group-hover:bg-primary/20"
                      }`}
                      radius="full"
                    />
                    <div className="flex-grow text-left overflow-hidden">
                      <div className="flex justify-between items-center w-full">
                        <p
                          className={`font-semibold text-sm ${isSelected ? "text-white" : "text-default-900"}`}
                        >
                          ໂຕະ {table.name}
                        </p>
                        {lastMsg && (
                          <span
                            className={`text-[10px] ${isSelected ? "text-white/70" : "text-default-400"}`}
                          >
                            {new Date(lastMsg.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs truncate font-medium mt-0.5 ${
                            isSelected
                              ? "text-white/80"
                              : unreadCount > 0
                                ? "text-default-900"
                                : "text-default-400"
                          } ${typingStatus[table.id] ? "text-primary italic animate-pulse" : ""}`}
                        >
                          {typingStatus[table.id] ? "ລູກຄ້າກຳລັງພິມ..." : (lastMsg?.text || "ບໍ່ມີຂໍ້ຄວາມໃໝ່")}
                        </p>
                        {unreadCount > 0 && !typingStatus[table.id] && (
                          <span
                            className={`ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                              isSelected
                                ? "bg-white text-primary"
                                : "bg-danger text-white"
                            }`}
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Main: Chat Area */}
      <Card className="flex-grow h-full border-none shadow-medium bg-background/60 backdrop-blur-xl overflow-hidden relative">
        <CardBody className="p-0 flex flex-col h-full relative z-10">
          {selectedTable ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 flex flex-row items-center justify-between bg-white/40 backdrop-blur-md border-b border-default-200/50 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      icon={<User size={24} />}
                      className="bg-primary/10 text-primary w-12 h-12"
                      radius="full"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-default-900 tracking-tight flex items-center gap-2">
                      ໂຕະ {selectedTable.name}
                    </h3>
                    <p className="text-xs text-default-500 font-medium flex items-center gap-1">
                      <Hash size={12} /> ID: {selectedTable.id}
                    </p>
                  </div>
                </div>
                <Button isIconOnly variant="light" radius="full">
                  <MoreVertical size={20} className="text-default-500" />
                </Button>
              </div>

              {/* Chat Messages */}
              <ScrollShadow
                className="flex-grow p-6 flex flex-col gap-4 overflow-y-auto"
                ref={scrollRef}
              >
                {currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-60 text-center animate-appearance-in">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner relative">
                      <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-75"></div>
                      <MessageCircle
                        size={56}
                        className="text-primary relative z-10"
                      />
                    </div>
                    <p className="font-bold text-2xl text-default-800 mb-2">
                      ເລີ່ມການສົນທະນາ
                    </p>
                    <p className="text-sm text-default-500 max-w-[250px]">
                      ສົ່ງຂໍ້ຄວາມທັກທາຍລູກຄ້າທີ່ໂຕະ {selectedTable.name}{" "}
                      ໄດ້ເລີຍ!
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg, index) => {
                    const isStaff = msg.sender === "staff";
                    const isLast = index === currentMessages.length - 1;
                    const prevMsg =
                      index > 0 ? currentMessages[index - 1] : null;
                    const showTime =
                      !prevMsg ||
                      new Date(msg.timestamp).getTime() -
                        new Date(prevMsg.timestamp).getTime() >
                        5 * 60000;

                    return (
                      <div
                        key={msg.id}
                        className="flex flex-col animate-appearance-in"
                      >
                        {showTime && (
                          <div className="flex justify-center my-4">
                            <span className="text-xs font-semibold text-default-400 bg-default-100/50 px-3 py-1 rounded-full backdrop-blur-md">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-end gap-2 max-w-[80%] ${
                            isStaff ? "self-end flex-row-reverse" : "self-start"
                          } ${!isLast ? "mb-1" : "mb-2"}`}
                        >
                          {!isStaff && (
                            <Avatar
                              size="sm"
                              icon={<User size={14} />}
                              className="w-6 h-6 mb-1 text-primary bg-primary/10 flex-shrink-0"
                            />
                          )}
                          <div
                            className={`p-3.5 text-[15px] shadow-sm relative ${
                              isStaff
                                ? "bg-primary text-white rounded-2xl rounded-br-sm"
                                : "bg-white text-default-800 rounded-2xl rounded-bl-sm border border-default-100"
                            }`}
                          >
                            <span className="leading-relaxed whitespace-pre-wrap">
                              {msg.text}
                            </span>
                            <div
                              className={`text-[10px] flex items-center justify-end mt-1 gap-1 ${isStaff ? "text-white/70" : "text-default-400"}`}
                            >
                              {(!isStaff || (isStaff && msg.status !== "sending")) && <Clock size={10} />}
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {isStaff && (
                                <span className="ml-0.5 flex items-center">
                                  {msg.status === "sending" && <Clock size={12} className="text-white/50" />}
                                  {msg.status === "sent" && <Check size={14} className="text-white/80" />}
                                  {msg.status === "delivered" && <CheckCheck size={14} className="text-white/80" />}
                                  {msg.status === "read" && <CheckCheck size={14} className="text-blue-200" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {selectedTableId && typingStatus[selectedTableId] && (
                  <div className="flex flex-col animate-appearance-in mb-2 mt-1">
                    <div className="flex items-end gap-2 self-start">
                      <Avatar
                        size="sm"
                        icon={<User size={14} />}
                        className="w-6 h-6 mb-1 text-primary bg-primary/10 flex-shrink-0"
                      />
                      <div className="p-3.5 text-[15px] shadow-sm relative bg-white text-default-800 rounded-2xl rounded-bl-sm border border-default-100 flex items-center justify-center gap-1.5 h-[46px]">
                        <span className="w-1.5 h-1.5 bg-default-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-default-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-default-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollShadow>

              {/* Chat Input */}
              <div className="p-4 bg-white/60 backdrop-blur-xl border-t border-default-200/50 sticky bottom-0 z-20">
                <div className="flex gap-3 items-end mx-auto">
                  <div className="flex-grow relative">
                    <textarea
                      placeholder="ພິມຂໍ້ຄວາມຂອງທ່ານທີ່ນີ້..."
                      value={inputText}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="w-full bg-default-100/80 hover:bg-default-200/50 focus:bg-white focus:border-primary border border-transparent transition-all outline-none rounded-3xl py-3.5 px-5 text-[15px] resize-none overflow-y-auto min-h-[52px] max-h-[120px] shadow-sm"
                      rows={1}
                      style={{
                        height: "auto",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 120) + "px";
                      }}
                    />
                  </div>
                  <Button
                    color="primary"
                    radius="full"
                    isIconOnly
                    size="lg"
                    onPress={sendMessage}
                    isDisabled={!inputText.trim()}
                    className={`shadow-md transition-all duration-300 min-w-[52px] h-[52px] flex-shrink-0 ${
                      inputText.trim()
                        ? "bg-primary shadow-primary/40 hover:scale-105"
                        : "bg-default-300 opacity-50"
                    }`}
                  >
                    <Send
                      size={20}
                      className={
                        inputText.trim()
                          ? "translate-x-0.5 -translate-y-0.5"
                          : ""
                      }
                    />
                  </Button>
                </div>
                <div className="text-center mt-2">
                  <p className="text-[10px] text-default-400 font-medium">
                    ກົດ Enter ເພື່ອສົ່ງ, Shift + Enter ເພື່ອລົງແຖວໃໝ່
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center relative overflow-hidden">
              {/* Background Decorative Elements */}
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col items-center animate-appearance-in">
                <div className="w-28 h-28 rounded-3xl bg-default-100/50 backdrop-blur-md border border-white/40 flex items-center justify-center mb-6 shadow-xl shadow-default-200/20 rotate-3 hover:rotate-0 transition-all duration-500">
                  <LayoutGrid size={48} className="text-primary/70" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-br from-default-800 to-default-500 bg-clip-text text-transparent mb-3">
                  ເລືອກໂຕະເພື່ອເລີ່ມການສົນທະນາ
                </h2>
                <p className="text-sm font-medium text-default-500 max-w-[300px] leading-relaxed">
                  ກະລຸນາເລືອກລາຍການໂຕະຈາກແຖບດ້ານຊ້າຍເພື່ອເບິ່ງຂໍ້ຄວາມ ຫຼື
                  ຕອບກັບລູກຄ້າ
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
