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
} from "@heroui/react";
import { Send, Search, MessageCircle, User } from "lucide-react";
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

  // Hook into socket for live MESSAGE display in the active chat window
  useEffect(() => {
    if (storeId) {
      const handleReceiveMessage = (data: Message) => {
        if (data.sender === "staff") return;

        setMessages((prev) => ({
          ...prev,
          [data.tableId]: [
            ...(prev[data.tableId] || []),
            { ...data, id: Date.now() + Math.random() },
          ],
        }));
      };

      socket.on("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
      return () => {
        socket.off("CHAT_MESSAGE_RECEIVED", handleReceiveMessage);
      };
    }
  }, [storeId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedTableId) return;
      try {
        const res = await axiosInstance.get(
          API_ENDPOINTS.CHAT.HISTORY(selectedTableId),
        );
        setMessages((prev) => ({
          ...prev,
          [selectedTableId]: res.data?.data || [],
        }));

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

    const msgData: Omit<Message, "id"> = {
      storeId,
      tableId: selectedTableId,
      text: inputText,
      sender: "staff",
      timestamp: new Date().toISOString(),
    };

    socket.emit("SEND_CHAT_MESSAGE", msgData);

    setMessages((prev) => ({
      ...prev,
      [selectedTableId]: [
        ...(prev[selectedTableId] || []),
        { ...msgData, id: Date.now() },
      ],
    }));
    setInputText("");
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
      <Card className="w-80 h-full border-none shadow-xl bg-white/80 backdrop-blur-md">
        <CardBody className="p-0 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-2">
              <MessageCircle size={24} />
              ສົນທະນາ
            </h2>
            <Input
              placeholder="ຄົ້ນຫາໂຕະ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search size={18} className="text-default-400" />}
              radius="full"
              variant="flat"
            />
          </div>
          <ScrollShadow className="flex-grow p-2">
            <div className="flex flex-col gap-1">
              {filteredTables.map((table: TableItem) => {
                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      selectedTableId === table.id
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "hover:bg-default-100 text-default-700"
                    }`}
                  >
                    <Avatar
                      icon={<User size={20} />}
                      className={
                        selectedTableId === table.id
                          ? "bg-white/20"
                          : "bg-primary/10 text-primary"
                      }
                      radius="full"
                    />
                    <div className="flex-grow text-left">
                      <p className="font-bold text-sm">ໂຕະ {table.name}</p>
                      <p
                        className={`text-[10px] truncate max-w-[120px] font-medium ${
                          selectedTableId === table.id
                            ? "text-white/70"
                            : "text-default-400"
                        }`}
                      >
                        {(
                          (messages[table.id] || [])[
                            (messages[table.id] || []).length - 1
                          ] || lastMessages[table.id]
                        )?.text || "ບໍ່ມີຂໍ້ຄວາມໃໝ່"}
                      </p>
                    </div>
                    {unreadCounts[table.id] > 0 && (
                      <div
                        className={`min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-in fade-in zoom-in duration-300 ${
                          selectedTableId === table.id
                            ? "bg-white text-primary"
                            : "bg-danger text-white"
                        }`}
                      >
                        {unreadCounts[table.id]}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Main: Chat Area */}
      <Card className="flex-grow h-full border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
        <CardBody className="p-0 flex flex-col h-full">
          {selectedTable ? (
            <>
              <div className="p-4 border-b flex items-center bg-white/50">
                <Avatar
                  icon={<User size={20} />}
                  className="bg-primary/10 text-primary mr-3"
                />
                <div>
                  <h3 className="font-black text-default-900 tracking-tight">
                    ໂຕະ {selectedTable.name}
                  </h3>
                  <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest">
                    ID: {selectedTable.id}
                  </p>
                </div>
              </div>

              <ScrollShadow
                className="flex-grow p-6 flex flex-col gap-6"
                ref={scrollRef}
              >
                {currentMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30 text-center scale-90">
                    <div className="w-24 h-24 rounded-full bg-default-100 flex items-center justify-center mb-6 shadow-inner">
                      <MessageCircle size={48} className="text-default-400" />
                    </div>
                    <p className="font-black text-lg text-default-600 mb-1">
                      ເລີ່ມການສົນທະນາ
                    </p>
                    <p className="text-sm font-bold text-default-400">
                      ສົນທະນາກັບລູກຄ້າທີ່ ໂຕະ {selectedTable.name} ຂອງພະແນກ
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === "staff" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-3xl text-sm font-semibold shadow-sm ${
                          msg.sender === "staff"
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-white text-default-900 rounded-bl-none border border-default-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-default-400 mt-2 font-bold px-3 uppercase tracking-tighter">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </ScrollShadow>

              <div className="p-6 border-t bg-white/50 backdrop-blur-sm">
                <div className="flex gap-4 items-center">
                  <Input
                    fullWidth
                    placeholder="ຂຽນຂໍ້ຄວາມຫາລູກຄ້າ..."
                    radius="full"
                    size="lg"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="bg-white shadow-sm"
                    classNames={{
                      input: "text-sm font-semibold",
                    }}
                  />
                  <Button
                    color="primary"
                    radius="full"
                    isIconOnly
                    size="lg"
                    onPress={sendMessage}
                    className="shadow-lg shadow-primary/30 min-w-[56px] h-[56px]"
                  >
                    <Send size={22} className="ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10">
              <div className="w-32 h-32 rounded-full bg-default-100 flex items-center justify-center mb-8 shadow-inner">
                <MessageCircle size={64} className="text-default-400" />
              </div>
              <h2 className="text-2xl font-black text-default-600 mb-2">
                ເລືອກໂຕະເພື່ອເລີ່ມການສົນທະນາ
              </h2>
              <p className="text-sm font-bold text-default-400 max-w-[280px] leading-relaxed">
                ຕິດຕາມ ແລະ ຕອບຄຳຖາມຂອງລູກຄ້າເພື່ອການບໍລິການທີ່ດີຂຶ້ນ
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
