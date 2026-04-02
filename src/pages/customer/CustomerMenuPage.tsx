import React, { useState, useMemo, useEffect } from "react";
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
  Modal,
  ModalContent,
  Chip,
} from "@heroui/react";
import { Plus, ShoppingCart, CheckCircle2, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import ListmenuSelect from "./ListmenuSelect";
/* import html2canvas from "html2canvas"; */
import { socket } from "@/config/socket";

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

  const [isTableClosed, setIsTableClosed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [bankName, setBankName] = useState<string | null>(null);
  const [finalOrder, setFinalOrder] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isDownloading, setIsDownloading] = useState(false);
  const billRef = React.useRef<HTMLDivElement>(null);

  const {
    isOpen: isCartOpen,
    onOpen: onOpenCart,
    onOpenChange: onCartOpenChange,
    onClose: onCloseCart,
  } = useDisclosure();

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
            // isClosing => Don't clear placedOrders yet, but if cart present, use it
            if (data.cart && data.cart.length > 0) {
              setPlacedOrders(data.cart);
            }
          }

          if (isClosing) {
            if (data.order) {
              setFinalOrder(data.order);
            }
            setIsTableClosed(true);
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
        }
      };

      socket.on("TABLE_CART_UPDATED", handleCartUpdate);
      socket.on("TABLE_SESSION_ENDED", handleTableClosed);

      return () => {
        socket.off("TABLE_CART_UPDATED", handleCartUpdate);
        socket.off("TABLE_SESSION_ENDED", handleTableClosed);
      };
    }
  }, [storeId, tableData?.id, qrCode]);

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

  const addToCart = (product: any) => {
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
    toast.success(`ເພີ່ມ ${product.name} ລົງກະຕ່າແລ້ວ!`);
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

  const onUpdatePlacedQuantity = (index: number, delta: number) => {
    if (isTableClosed || !tableData?.id) return;
    const item = placedOrders[index];
    if (delta > 0 && item && item.quantity >= (item.stockQty || 999)) {
      toast.error(
        `ຂໍອະໄພ, ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`,
      );
      return;
    }
    if (socket.connected) {
      socket.emit("CUSTOMER_UPDATE_QTY", {
        tableId: tableData.id,
        index,
        delta,
      });
    }
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH":
        return "success";
      case "TRANSFER":
        return "primary";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "ເງິນສົດ";
      case "TRANSFER":
        return "ເງິນໂອນ";
      default:
        return method;
    }
  };

  const handleDownloadBill = async () => {
    if (!billRef.current) {
      toast.error("ບິນບໍ່ພົບໃນໜ້າຈໍ");
      return;
    }
    
    setIsDownloading(true);
    try {
      // Import html2canvas dynamically
      const h2cModule = await import("html2canvas");
      const html2canvas = h2cModule.default || h2cModule;
      
      // Ensure we have a valid DOM node
      const element = billRef.current;
      
      await new Promise((resolve) => setTimeout(resolve, 400));

      const canvas = await (html2canvas as any)(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document) => {
          // 1. Broadly sanitize ALL style tags to remove oklch/oklab functions
          const styleTags = clonedDoc.getElementsByTagName("style");
          for (let i = 0; i < styleTags.length; i++) {
            try {
              let css = styleTags[i].innerHTML;
              // Replace any occurrence of oklch(...) or oklab(...) with a fallback color
              css = css.replace(/oklch\([^)]+\)/g, "#000");
              css = css.replace(/oklab\([^)]+\)/g, "#000");
              styleTags[i].innerHTML = css;
            } catch (e) {
              console.warn("Style tag sanitization failed", e);
            }
          }

          // 2. Clear problematic HeroUI variables that might still be in scope
          const styleOverride = clonedDoc.createElement("style");
          styleOverride.innerHTML = `
            * {
              -webkit-animation: none !important;
              animation: none !important;
              transition: none !important;
            }
            /* Explicitly re-apply standard colors to key components */
            .text-primary { color: #0070f3 !important; }
            .bg-primary { background-color: #0070f3 !important; }
            .text-success { color: #17c964 !important; }
            .bg-success { background-color: #17c964 !important; }
            .text-danger { color: #f31260 !important; }
            .bg-danger { background-color: #f31260 !important; }
            .text-default-400 { color: #a1a1aa !important; }
            .text-default-500 { color: #71717a !important; }
            .text-default-600 { color: #52525b !important; }
            .text-default-800 { color: #27272a !important; }
            .text-default-900 { color: #18181b !important; }
            .bg-default-100 { background-color: #f4f4f5 !important; }
            .bg-gray-50\\/80 { background-color: #f9fafb !important; }
          `;
          clonedDoc.head.appendChild(styleOverride);

          // 3. Hide bouncing/pulsing icons
          const elementsToHide = clonedDoc.querySelectorAll(".animate-pulse, .animate-bounce");
          elementsToHide.forEach((el: any) => el.style.display = "none");
        }
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Bill-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("ດາວໂຫຼດບິນສຳເລັດ!");
    } catch (error: any) {
      console.error("Critical download failure:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Show the actual error to the user so they can report what it says
      toast.error(`ຂໍ້ຜິດພາດ: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

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
            ກະລຸນາຕິດຕໍ່ພະນັກງານເພື່ອເປີດໂຕະໃໝ່.
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
            {filteredProducts?.map((product: any) => (
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
                      onPress={() => addToCart(product)}
                      isDisabled={product.stockQty <= 0 || isTableClosed}
                    >
                      <Plus size={16} className="mr-1" /> ເເພີ່ມລົງກະຕ່າ
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isTableClosed}
        onOpenChange={(open) => !open && setIsTableClosed(true)}
        isDismissable={false}
        hideCloseButton
        backdrop="blur"
        size="md"
        placement="top"
        className="mx-4 rounded-3xl"
        scrollBehavior="outside"
      >
        <ModalContent className="bg-transparent shadow-none border-none">
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success animate-bounce shadow-lg mb-4 backdrop-blur-md">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-black text-white uppercase drop-shadow-md">
                ຂອບໃຈຫຼາຍໆ!
              </h1>
              <p className="text-white/80 font-medium text-sm drop-shadow-sm">
                ການຊຳລະເງິນສຳເລັດແລ້ວ.
              </p>
            </div>

            <div ref={billRef} className="w-full max-w-sm">
              <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-white w-full overflow-hidden rounded-3xl">
                <CardBody className="p-0">
                  <div className="p-6 border-b border-divider flex flex-col items-center gap-1 bg-gray-50/80">
                    <h2 className="text-xl font-black text-primary uppercase">
                      {tableData?.store?.name}
                    </h2>
                    <p className="text-xs text-default-500 font-bold font-sans">
                      #{finalOrder?.orderNumber || `BILL-${tableData?.name}`}
                    </p>
                    <div className="mt-2 text-[10px] text-default-400 font-medium flex gap-2">
                      <span>📍 {tableData?.store?.address || "Address"}</span>
                      <span>📞 {tableData?.store?.tel || "-"}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-1">
                        <p className="text-[10px] text-default-400 font-bold uppercase tracking-wider">
                          ວັນທີ/ເວລາ
                        </p>
                        <p className="text-xs font-bold font-sans">
                          {finalOrder?.createdAt
                            ? new Date(finalOrder.createdAt).toLocaleString(
                                "lo-LA",
                              )
                            : new Date().toLocaleString("lo-LA")}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] text-default-400 font-bold uppercase tracking-wider">
                          ພະນັກງານ
                        </p>
                        <p className="text-xs font-bold text-primary">
                          {finalOrder?.employee?.name || "ເຈົ້າຂອງຮ້ານ"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-default-100 rounded-2xl border border-divider">
                      <span className="text-xs font-bold text-default-600">
                        ຮູບແບບການຊຳລະ:
                      </span>
                      <Chip
                        size="sm"
                        color={getPaymentMethodColor(
                          finalOrder?.paymentMethod || paymentMethod || "",
                        )}
                        variant="flat"
                        className="font-black text-[10px] uppercase"
                      >
                        {getPaymentMethodLabel(
                          finalOrder?.paymentMethod || paymentMethod || "",
                        )}
                        {finalOrder?.bank?.name
                          ? ` (${finalOrder.bank.name})`
                          : bankName
                            ? ` (${bankName})`
                            : ""}
                      </Chip>
                    </div>

                    <div className="border-t border-dashed border-divider pt-4 space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-1 text-[10px] font-black text-default-400 uppercase tracking-tighter text-left border-b border-divider pb-2">
                        <div className="col-span-1">#</div>
                        <div className="col-span-5">ລາຍການ</div>
                        <div className="col-span-1 text-center">ຈຳນວນ</div>
                        <div className="col-span-2 text-right">ລາຄາ</div>
                        <div className="col-span-3 text-right">ລວມ</div>
                      </div>

                      <div className="space-y-3 pr-1">
                        {(finalOrder?.items || placedOrders)
                          .filter(
                            (i: any) => i.status?.toUpperCase() !== "CANCEL",
                          )
                          .map((item: any, idx: number) => {
                            const productName = item.product?.name || item.name;
                            const qty = item.qty || item.quantity;
                            const price = item.unitPrice || item.price;
                            return (
                              <div
                                key={idx}
                                className="grid grid-cols-12 gap-1 text-[11px] font-bold border-b border-divider/5 pb-2 items-start text-left"
                              >
                                <div className="col-span-1 text-default-400 font-medium">
                                  {idx + 1}
                                </div>
                                <div className="col-span-5 text-default-800 line-clamp-2 leading-tight">
                                  {productName}
                                </div>
                                <div className="col-span-1 text-center text-primary font-black">
                                  {qty}
                                </div>
                                <div className="col-span-2 text-right text-default-500">
                                  {formatNumber(price)}
                                </div>
                                <div className="col-span-3 text-right text-default-900 font-black">
                                  {formatNumber(price * qty)}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-primary/20 space-y-2">
                      <div className="flex justify-between items-center text-xs text-default-500 font-bold">
                        <span>ຍອດລວມ (Total):</span>
                        <span className="font-sans">
                          {formatNumber(
                            finalOrder?.totalAmount ||
                              placedOrders.reduce(
                                (acc, item) =>
                                  item.status?.toUpperCase() === "CANCEL"
                                    ? acc
                                    : acc +
                                      Number(item.price) *
                                        Number(item.quantity),
                                0,
                              ),
                          )}{" "}
                          ₭
                        </span>
                      </div>
                      {finalOrder && (
                        <>
                          <div className="flex justify-between items-center text-xs text-default-500 font-bold">
                            <span>ຮັບເງິນ (Received):</span>
                            <span className="font-sans">
                              {formatNumber(finalOrder.receivedAmount)} ₭
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-black text-primary">
                            <span>ເງິນທອນ (Change):</span>
                            <span className="text-lg font-sans">
                              {formatNumber(finalOrder.change)} ₭
                            </span>
                          </div>
                        </>
                      )}
                      {!finalOrder && (
                        <div className="flex justify-between items-center text-sm font-black text-primary pt-1">
                          <span>ຍອດລວມທັງໝົດ:</span>
                          <span className="text-xl font-sans">
                            {formatNumber(
                              placedOrders.reduce(
                                (acc, item) =>
                                  item.status?.toUpperCase() === "CANCEL"
                                    ? acc
                                    : acc +
                                      Number(item.price) *
                                        Number(item.quantity),
                                0,
                              ),
                            )}{" "}
                            ₭
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-primary/5 text-primary font-black text-center text-sm border-t border-dashed border-divider italic">
                    ⭐ ຂໍຂອບໃຈທີ່ໃຊ້ບໍລິການ! ກະລຸນາກັບມາໃໝ່ເດີ້ ⭐
                  </div>
                </CardBody>
              </Card>
            </div>

            <Button
              color="primary"
              variant="shadow"
              size="lg"
              className="mt-8 w-full max-w-sm rounded-2xl font-black h-14 text-lg animate-pulse"
              startContent={!isDownloading && <Download size={24} />}
              onClick={handleDownloadBill}
              isLoading={isDownloading}
            >
              ດາວໂຫຼດບິນ (DOWNLOAD BILL)
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
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
        onUpdatePlacedQuantity={onUpdatePlacedQuantity}
      />
    </div>
  );
}
