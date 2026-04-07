import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Image,
  ScrollShadow,
  Badge,
  useDisclosure,
} from "@heroui/react";
import { Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import ListmenuSelect from "./ListmenuSelect";
import BillModal from "@/components/common/bill";
import { socket } from "@/config/socket";
import ChatPage from "./chatPage";

export default function CustomerMenuPage() {
  const { qrCode } = useParams<{ qrCode: string }>();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.documentElement.style.colorScheme = "light";
  }, []);

  const [cart, setCart] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`cart_${qrCode}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [placedOrders, setPlacedOrders] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`placedOrders_${qrCode}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isTableClosed, setIsTableClosed] = useState(() => {
    return sessionStorage.getItem(`tableClosed_${qrCode}`) === "true";
  });
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [bankName, setBankName] = useState<string | null>(null);
  const [finalOrder, setFinalOrder] = useState<any | null>(() => {
    const saved = sessionStorage.getItem(`finalOrder_${qrCode}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const {
    isOpen: isCartOpen,
    onOpen: onOpenCart,
    onOpenChange: onCartOpenChange,
    onClose: onCloseCart,
  } = useDisclosure();

  const {
    isOpen: isChatOpen,
    onOpen: onOpenChat,
    onOpenChange: onChatOpenChange,
  } = useDisclosure();

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const cartRef = useRef<HTMLDivElement>(null);
  const [flyingItems, setFlyingItems] = useState<any[]>([]);

  useEffect(() => {
    if (qrCode) {
      localStorage.setItem(`cart_${qrCode}`, JSON.stringify(cart));
    }
  }, [cart, qrCode]);

  useEffect(() => {
    if (qrCode) {
      localStorage.setItem(
        `placedOrders_${qrCode}`,
        JSON.stringify(placedOrders),
      );
    }
  }, [placedOrders, qrCode]);

  const { data: tableData, isLoading: isLoadingTable } = useQuery({
    queryKey: ["public-table", qrCode],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/public/table/${qrCode}`);
      return res.data?.data;
    },
    enabled: !!qrCode,
  });

  useEffect(() => {
    if (tableData?.activeCart && Array.isArray(tableData.activeCart)) {
      setPlacedOrders(tableData.activeCart);
    }
  }, [tableData?.id, tableData?.activeCart]);

  const storeId = tableData?.storeId;

  useEffect(() => {
    if (storeId && tableData?.id) {
      if (!socket.connected) socket.connect();
      socket.emit("JOIN:STORE", storeId);

      const handleCartUpdate = (data: {
        tableId: string;
        cart: any[];
        tableStatus?: string;
        paymentMethod?: string;
        bankName?: string;
        order?: any;
      }) => {
        if (data.tableId === tableData.id) {
          const isClosing =
            data.tableStatus === "AVAILABLE" ||
            (data as any).status === "AVAILABLE";

          if (!isClosing) {
            setPlacedOrders(data.cart || []);
          } else {
            if (data.cart && data.cart.length > 0) {
              setPlacedOrders(data.cart);
            }
          }

          if (isClosing) {
            if (data.order) {
              setFinalOrder(data.order);
              sessionStorage.setItem(
                `finalOrder_${qrCode}`,
                JSON.stringify(data.order),
              );
            }
            setIsTableClosed(true);
            sessionStorage.setItem(`tableClosed_${qrCode}`, "true");

            if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
            if (data.bankName) setBankName(data.bankName);
            localStorage.removeItem(`cart_${qrCode}`);
            localStorage.removeItem(`placedOrders_${qrCode}`);
          }
        }
      };

      const handleTableClosed = (data: { tableId: string }) => {
        if (data.tableId === tableData.id) {
          setIsTableClosed(true);
          sessionStorage.setItem(`tableClosed_${qrCode}`, "true");
        }
      };

      const playNotificationSound = () => {
        const audio = new Audio("/assets/void/pop_ding.mp3");
        audio.play().catch((err) => console.log("Audio play error:", err));
      };

      const handleReceiveChatMessage = (data: {
        tableId: string;
        sender: "staff" | "customer";
      }) => {
        if (data.tableId === tableData.id && data.sender === "staff") {
          playNotificationSound();
          if (!isChatOpen) {
            setUnreadChatCount((prev) => prev + 1);
          }
        }
      };

      socket.on("TABLE_CART_UPDATED", handleCartUpdate);
      socket.on("TABLE_SESSION_ENDED", handleTableClosed);
      socket.on("CHAT_MESSAGE_RECEIVED", handleReceiveChatMessage);

      return () => {
        socket.off("TABLE_CART_UPDATED", handleCartUpdate);
        socket.off("TABLE_SESSION_ENDED", handleTableClosed);
        socket.off("CHAT_MESSAGE_RECEIVED", handleReceiveChatMessage);
      };
    }
  }, [storeId, tableData?.id, qrCode, isChatOpen]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["public-products", storeId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/public/products/${storeId}`);
      return res.data?.data;
    },
    enabled: !!storeId,
  });

  const categories = useMemo(() => {
    if (!productsData) return [];
    const uniqueMap = new Map();
    productsData.forEach((product: any) => {
      if (product.category)
        uniqueMap.set(product.category.id, product.category);
    });
    return Array.from(uniqueMap.values());
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (!productsData) return [];
    if (selectedCategory === "ALL") return productsData;
    return productsData.filter((p: any) => p.category?.id === selectedCategory);
  }, [productsData, selectedCategory]);

  const submitOrderMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post(`/api/v1/public/order`, payload);
      return res.data;
    },
    onSuccess: () => {
      setCart([]);
      onCloseCart();
      toast.success("ສົ່ງອໍເດີສຳເລັດ! ກະລຸນາລໍຖ້າອາຫານຈັກໜ້ອຍ.");
    },
    onError: () => {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອໍເດີ. ລອງໃໝ່ອີກຄັ້ງ!");
    },
  });

  const addToCart = (product: any, e?: React.MouseEvent) => {
    console.log("addToCart triggered", { product, hasEvent: !!e });
    if (isTableClosed) {
      toast.error("ໂຕະຖືກປິດແລ້ວ, ບໍ່ສາມາດສັ່ງອາຫານໄດ້.");
      return;
    }
    const existing = cart.find((item) => item.id === product.id);
    const existingQty = existing?.quantity || 0;

    if (existingQty >= (product.stockQty || 999)) {
      toast.error(
        `ຂໍອະໄພ, ສິນຄ້າ "${product.name}" ມີໃນສາງພຽງ ${product.stockQty} ລາຍການ`,
      );
      return;
    }

    setCart((prev) => {
      const isItemInCart = prev.find((item) => item.id === product.id);
      if (isItemInCart) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Animation logic
    let buttonRect: DOMRect | undefined;
    const targetElement = e?.currentTarget as HTMLElement;

    if (targetElement) {
      buttonRect = targetElement.getBoundingClientRect();
    } else {
      buttonRect = (
        document.activeElement as HTMLElement
      )?.getBoundingClientRect();
    }

    const cartIconRect = cartRef.current?.getBoundingClientRect();

    console.log("Position check:", { buttonRect, cartIconRect });

    if (buttonRect && cartIconRect) {
      const id = Math.random().toString(36).substring(2, 9);
      const newItem = {
        id,
        startX: buttonRect.left + buttonRect.width / 2,
        startY: buttonRect.top + buttonRect.height / 2,
        endX: cartIconRect.left + cartIconRect.width / 2,
        endY: cartIconRect.top + cartIconRect.height / 2,
        image: product.image,
      };
      console.log("Creating flying item:", newItem);
      setFlyingItems((prev) => [...prev, newItem]);
      setTimeout(() => {
        setFlyingItems((prev) => {
          const filtered = prev.filter((item) => item.id !== id);
          console.log("Removing flying item, count left:", filtered.length);
          return filtered;
        });
      }, 1000);
    }

    toast.success(`ເພີ່ມ ${product.name} ລົງກະຕ່າແລ້ວ!`, {
      duration: 1500,
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    if (isTableClosed) return;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            if (delta > 0 && item.quantity >= (item.stockQty || 999)) {
              toast.error(
                `ຂໍອະໄພ, ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`,
              );
              return item;
            }
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const updateNote = (id: string, note: string) => {
    if (isTableClosed) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item)),
    );
  };

  const submitOrder = () => {
    if (isTableClosed || cart.length === 0) return;
    submitOrderMutation.mutate({ tableId: tableData.id, storeId, items: cart });
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart],
  );
  const cartTotalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart],
  );

  if (isLoadingTable)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" color="primary" />
      </div>
    );

  if (!tableData)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center text-danger mb-6">
          <Plus size={40} className="rotate-45" />
        </div>
        <h2 className="text-2xl font-black text-danger uppercase">
          ບໍ່ພົບຂໍ້ມູນໂຕະ (404)
        </h2>
        <p className="text-default-500 mt-2 font-medium">
          ກະລຸນາກວດສອບ QR Code ຄືນໃໝ່.
        </p>
      </div>
    );

  // If table is AVAILABLE and we are NOT in the closed/bill process
  if (tableData?.status === "AVAILABLE" && !isTableClosed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center gap-8">
        <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center text-danger shadow-inner animate-pulse">
          <Plus size={48} className="rotate-45" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-danger uppercase tracking-tight">
            ໂຕະໄດ້ຖືກປິດແລ້ວ
          </h2>
          <p className="text-default-500 font-medium max-w-xs mx-auto">
            ຂໍອະໄພ, ໂຕະນີ້ໄດ້ຖືກປິດການບໍລິການແລ້ວ.
            ກະລຸນາຕິດຕໍ່ພะນັກງານເພື່ອເປີດໂຕະໃໝ່.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-30 mt-8">
          {tableData.store?.logoUrl ? (
            <Image
              src={getDisplayImageUrl(tableData.store.logoUrl)}
              className="w-20 h-20 rounded-2xl object-cover grayscale"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-default-300" />
          )}
          <p className="font-bold text-xs">{tableData.store?.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-[200px]">
      <header className="bg-white w-full rounded-b-3xl shadow-sm relative z-50 overflow-hidden">
        <div className="h-16 bg-primary/10 w-full absolute top-0 left-0" />
        <div className="max-w-2xl mx-auto px-5 pt-8 pb-5 relative text-center flex flex-col items-center">
          {tableData.store?.logoUrl ? (
            <Image
              src={getDisplayImageUrl(tableData.store.logoUrl)}
              className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg border-2 border-white text-white font-black text-2xl mb-3">
              {tableData.store?.name?.charAt(0)}
            </div>
          )}
          <h1 className="text-xl font-black text-default-900">
            {tableData.store?.name}
          </h1>
          <div className="mt-3 bg-primary text-white text-sm font-black px-4 py-1.5 rounded-full shadow-md">
            ໂຕະ {tableData.name}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {!isLoadingProducts && categories.length > 0 && (
          <ScrollShadow
            orientation="horizontal"
            className="flex gap-2 w-full no-scrollbar pb-4"
            hideScrollBar
          >
            <Button
              size="sm"
              radius="full"
              variant={selectedCategory === "ALL" ? "solid" : "flat"}
              color="primary"
              onPress={() => setSelectedCategory("ALL")}
              className="font-bold"
            >
              ທັງໝົດ
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                size="sm"
                radius="full"
                variant={selectedCategory === cat.id ? "solid" : "flat"}
                color="primary"
                onPress={() => setSelectedCategory(cat.id)}
                className="font-bold"
              >
                {cat.name}
              </Button>
            ))}
          </ScrollShadow>
        )}

        {isLoadingProducts ? (
          <div className="flex justify-center py-10">
            <Spinner color="primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts?.map((product: any) => {
              const currentInCart =
                cart.find((i: any) => i.id === product.id)?.quantity || 0;
              const alreadyPlaced = placedOrders
                .filter(
                  (i: any) =>
                    (i.id === product.id || i.product?.id === product.id) &&
                    i.status?.toUpperCase() !== "CANCEL",
                )
                .reduce((acc, i) => acc + (i.quantity || i.qty || 0), 0);
              const totalUsed = currentInCart + alreadyPlaced;

              return (
                <Card
                  key={product.id}
                  className="border-none shadow-sm hover:shadow-md transition-all bg-white overflow-hidden"
                >
                  <CardBody className="p-0 flex flex-col h-full">
                    <div className="relative aspect-[4/3]">
                      <img
                        src={getDisplayImageUrl(product.image)}
                        className="w-full h-full object-cover"
                      />
                      {product.stockQty <= 0 && (
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                          <span className="text-white font-bold bg-danger/90 px-2 py-0.5 rounded text-xs">
                            ໝົດແລ້ວ
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-grow flex flex-col justify-between gap-2">
                      <h3 className="font-bold text-sm line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-primary font-black text-sm">
                        {formatNumber(product.price)} ₭
                      </p>
                      <Button
                        color="primary"
                        variant="solid"
                        className="w-full font-bold text-xs h-9"
                        onClick={(e) => addToCart(product, e)}
                        isDisabled={
                          totalUsed >= (product.stockQty || 0) || isTableClosed
                        }
                      >
                        <Plus size={16} className="mr-1" /> ເພີ່ມລົງກະຕ່າ
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <BillModal
        isOpen={isTableClosed}
        onOpenChange={(open) => !open && setIsTableClosed(true)}
        tableData={tableData}
        finalOrder={finalOrder}
        paymentMethod={paymentMethod}
        bankName={bankName}
        placedOrders={placedOrders}
      />

      {/* Floating Buttons Group */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4 items-end">
        {/* Floating Cart Button */}
        <div ref={cartRef}>
          <Badge
            content={cartTotalItems + (placedOrders?.length || 0)}
            color="danger"
            shape="circle"
            size="lg"
            className="font-bold border-none"
            isInvisible={cartTotalItems + (placedOrders?.length || 0) === 0}
          >
            <Button
              isIconOnly
              color="primary"
              variant="shadow"
              size="lg"
              className="w-16 h-16 rounded-full shadow-2xl"
              onPress={onOpenCart}
            >
              <ShoppingCart size={28} className="text-white" />
            </Button>
          </Badge>
        </div>

        {/* Floating Chat Button */}
        <Badge
          content={unreadChatCount}
          color="danger"
          shape="circle"
          size="lg"
          className="font-bold border-none"
          isInvisible={unreadChatCount === 0}
        >
          <Button
            isIconOnly
            color="success"
            variant="shadow"
            size="lg"
            className="w-16 h-16 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95"
            onPress={() => {
              setUnreadChatCount(0);
              onOpenChat();
            }}
          >
            <MessageCircle size={28} className="text-white" />
          </Button>
        </Badge>
      </div>

      {/* Flying Animation Overlay */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              left: item.startX,
              top: item.startY,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: item.endX,
              top: item.endY,
              scale: 0.1,
              opacity: 0.2,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              position: "fixed",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 99999,
              width: 60,
              height: 60,
            }}
          >
            <div className="w-full h-full rounded-full border-2 border-white shadow-xl overflow-hidden bg-primary flex items-center justify-center">
              {item.image ? (
                <img
                  src={getDisplayImageUrl(item.image)}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <ShoppingCart className="text-white" size={24} />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <ListmenuSelect
        isOpen={isCartOpen}
        onOpenChange={onCartOpenChange}
        cart={cart}
        placedOrders={placedOrders}
        updateQuantity={updateQuantity}
        subtotal={subtotal}
        cartTotalItems={cartTotalItems}
        submitOrder={submitOrder}
        isPending={submitOrderMutation.isPending}
        updateNote={updateNote}
      />

      <ChatPage
        isOpen={isChatOpen}
        onOpenChange={onChatOpenChange}
        tableName={tableData?.name || ""}
        storeId={storeId || ""}
        tableId={tableData?.id || ""}
        logoUrl={tableData?.store?.logoUrl}
      />
    </div>
  );
}
