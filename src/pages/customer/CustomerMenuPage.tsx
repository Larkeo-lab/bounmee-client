import { useState, useMemo, useEffect } from "react";
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
  ModalContent
} from "@heroui/react";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import ListmenuSelect from "./ListmenuSelect";
import { socket } from "@/config/socket";

export default function CustomerMenuPage() {
  const { qrCode } = useParams<{ qrCode: string }>();
  
  // 1. Initial Load: Try to get cart and placedOrders from localStorage (Namespaced by qrCode)
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
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const { isOpen: isCartOpen, onOpen: onOpenCart, onOpenChange: onCartOpenChange, onClose: onCloseCart } = useDisclosure();

  // 2. Auto-save cart and placedOrders whenever they change
  useEffect(() => {
    if (qrCode) {
      localStorage.setItem(`cart_${qrCode}`, JSON.stringify(cart));
    }
  }, [cart, qrCode]);

  useEffect(() => {
    if (qrCode) {
      localStorage.setItem(`placedOrders_${qrCode}`, JSON.stringify(placedOrders));
    }
  }, [placedOrders, qrCode]);

  // 1. ดึงข้อมูลโต๊ะผ่าน Public API
  const { data: tableData, isLoading: isLoadingTable } = useQuery({
    queryKey: ["public-table", qrCode],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/public/table/${qrCode}`);
      return res.data?.data;
    },
    enabled: !!qrCode,
  });

  const storeId = tableData?.storeId;

  // 0. เชื่อมต่อ Socket เพื่อรับสถานะออเดอร์แบบ Real-time
  useEffect(() => {
    if (storeId && tableData?.id) {
      if (!socket.connected) {
        socket.connect();
      }
      
      // เข้าร่วมห้องของร้านค้า
      socket.emit("JOIN:STORE", storeId);
      console.log(`🔗 Customer joined room: store-${storeId} for table: ${tableData.id}`);

      const handleCartUpdate = (data: { tableId: string, cart: any[], tableStatus?: string }) => {
        if (data.tableId === tableData.id) {
          console.log("🔄 Ordered items sync received:", data.cart);
          setPlacedOrders(data.cart || []);
          
          if (data.tableStatus === "AVAILABLE") {
            setIsTableClosed(true);
            // Clear local cache for this table if session is officially over
            localStorage.removeItem(`cart_${qrCode}`);
            localStorage.removeItem(`placedOrders_${qrCode}`);
          }
        }
      };

      const handleTableClosed = (data: { tableId: string }) => {
        if (data.tableId === tableData.id) {
          console.log("🚫 Table session ended");
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
  }, [storeId, tableData?.id]);

  // 2. ดึงข้อมูลสินค้าของร้านค้าผ่าน Public API
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["public-products", storeId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/public/products/${storeId}`);
      return res.data?.data;
    },
    enabled: !!storeId,
  });

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!productsData) return [];
    const uniqueMap = new Map();
    productsData.forEach((product: any) => {
      if (product.category) {
        uniqueMap.set(product.category.id, product.category);
      }
    });
    return Array.from(uniqueMap.values());
  }, [productsData]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!productsData) return [];
    if (selectedCategory === "ALL") return productsData;
    return productsData.filter((p: any) => p.category?.id === selectedCategory);
  }, [productsData, selectedCategory]);

  // 3. ฟังก์ชันกดยืนยันสั่งอาหาร
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
    }
  });

  const addToCart = (product: any) => {
    if (isTableClosed) {
      toast.error("ໂຕ໊ະຖືກປິດແລ້ວ, ບໍ່ສາມາດສັ່ງອາຫານໄດ້.");
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    const existingQty = existing?.quantity || 0;

    if (existingQty >= (product.stockQty || 999)) {
      toast.error(`ຂໍອະໄພ, ສິນຄ້າ "${product.name}" ມີໃນສາງພຽງ ${product.stockQty} ລາຍການ`);
      return;
    }

    setCart((prev) => {
      const isItemInCart = prev.find(item => item.id === product.id);
      if (isItemInCart) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`ເພີ່ມ ${product.name} ລົງກະຕ່າແລ້ວ!`);
  };

  const updateQuantity = (id: string, delta: number) => {
    if (isTableClosed) return;
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        if (delta > 0 && item.quantity >= (item.stockQty || 999)) {
          toast.error(`ຂໍອະໄພ, ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`);
          return item;
        }
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const onUpdatePlacedQuantity = (index: number, delta: number) => {
    if (isTableClosed) return;
    const item = placedOrders[index];
    if (delta > 0 && item && item.quantity >= (item.stockQty || 999)) {
      toast.error(`ຂໍອະໄພ, ສິນຄ້າ "${item.name}" ມີໃນສາງພຽງ ${item.stockQty} ລາຍການ`);
      return;
    }
    if (socket.connected && tableData?.id) {
      socket.emit("CUSTOMER_UPDATE_QTY", {
        tableId: tableData.id,
        index,
        delta
      });
    }
  };

  const submitOrder = () => {
    if (isTableClosed) {
      toast.error("ໂຕ໊ະຖືກປິດແລ້ວ, ບໍ່ສາມາດສັ່ງອາຫານໄດ້ອີກ.");
      return;
    }
    if (cart.length === 0) return;
    submitOrderMutation.mutate({
      tableId: tableData.id,
      storeId: storeId,
      items: cart,
    });
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const cartTotalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  if (isLoadingTable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 p-8 text-center">
        <h2 className="text-2xl font-black text-danger">ບໍ່ພົບຂໍ້ມູນໂຕະ</h2>
        <p className="text-default-500">ລະຫັດ QR Code ອາດຈະຜິດພາດ ຫຼື ໝົດອາຍຸແລ້ວ</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-[200px]">
      {/* ປ້າຍຊື່ຮ້ານ / ໂຕະ */}
      <header className="bg-white w-full rounded-b-3xl shadow-sm relative z-50 overflow-hidden">
        {/* สีพื้นฐาน / แบ็คกราวน์ด้านบน */}
        <div className="h-16 bg-primary/10 w-full absolute top-0 left-0" />
        
        <div className="max-w-2xl mx-auto px-5 pt-8 pb-5 relative">
          <div className="flex gap-4 items-start">
            {tableData.store?.logoUrl ? (
              <Image 
                src={getDisplayImageUrl(tableData.store.logoUrl)} 
                className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white"
                alt={tableData.store?.name}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg border-2 border-white text-white font-black text-2xl shrink-0">
                {tableData.store?.name?.charAt(0) || "ຮ"}
              </div>
            )}
            
            <div className="flex-1 pt-1">
              <h1 className="text-xl font-black text-default-900 leading-tight">
                {tableData.store?.name || "ຮ້ານອາຫານ"}
              </h1>
              {tableData.store?.address && (
                <p className="text-xs text-default-500 mt-1 line-clamp-2">
                  📍 {tableData.store.address}
                </p>
              )}
              {tableData.store?.tel && (
                <p className="text-xs text-default-500 mt-0.5 font-bold">
                  📞 {tableData.store.tel}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-5 bg-default-50 rounded-xl p-3 flex justify-between items-center border border-default-100 shadow-inner">
            <span className="text-sm font-bold text-default-600">ສະຖານະ: <span className="text-primary">ລໍຖ້າການສັ່ງ</span></span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-default-400">ໂຕະ </span>
              <span className="bg-primary text-white text-sm font-black px-3 py-1 rounded-lg shadow-sm">
                {tableData.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ລາຍການເມນູอาหาร */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* หมวดหมู่ (Categories) */}
        {!isLoadingProducts && categories.length > 0 && (
          <ScrollShadow orientation="horizontal" className="flex gap-2 w-full no-scrollbar pb-4" hideScrollBar>
            <Button
              size="sm"
              radius="full"
              variant={selectedCategory === "ALL" ? "solid" : "flat"}
              color="primary"
              onPress={() => setSelectedCategory("ALL")}
              className="font-bold flex-shrink-0"
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
                className="font-bold flex-shrink-0"
              >
                {cat.name}
              </Button>
            ))}
          </ScrollShadow>
        )}
        
        {isLoadingProducts ? (
          <div className="flex justify-center py-10"><Spinner color="primary" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredProducts?.map((product: any) => (
              <Card key={product.id} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                <CardBody className="p-0 flex flex-col h-full">
                  <div className="relative w-full aspect-[4/3]">
                    <img 
                      src={getDisplayImageUrl(product.image)} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.stockQty <= 0 && (
                      <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                        <span className="text-white font-bold bg-danger/90 px-2 py-0.5 rounded text-xs tracking-wide">ໝົດແລ້ວ</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between gap-2 border-t border-gray-50">
                    <div>
                      <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-tight">{product.name}</h3>
                      <p className="text-primary font-black text-sm mt-1">{formatNumber(product.price)} ₭</p>
                    </div>
                    <Button 
                      color="primary" 
                      variant="flat" 
                      className="w-full font-bold text-xs h-9" 
                      onPress={() => addToCart(product)}
                      isDisabled={product.stockQty <= 0 || isTableClosed}
                    >
                      <Plus size={16} className="mr-1" /> ເພີ່ມລົງກະຕ່າ
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Locked Screen Modal เมื่อโต๊ะถูกปิด */}
      <Modal 
        isOpen={isTableClosed} 
        onOpenChange={(open) => {
          if (!open) setIsTableClosed(true);
        }}
        isDismissable={false}
        hideCloseButton
        backdrop="blur"
        size="md"
        placement="center"
        className="mx-4 rounded-3xl"
      >
        <ModalContent>
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center text-success animate-bounce shadow-lg shadow-success/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-primary uppercase tracking-tight">ຂອບໃຈຫຼາຍໆ!</h1>
              <p className="text-default-500 font-medium">ການຊຳລະເງິນສຳເລັດ ແລະ ໂຕ໊ະຂອງທ່ານຖືກປິດແລ້ວ.</p>
            </div>

            <Card className="border-none shadow-xl bg-gray-50 w-full">
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-default-400 uppercase tracking-widest">
                    <span>ຂໍ້ມູນການນັ່ງ</span>
                  </div>
                  <div className="border-t border-dashed border-divider pt-4 space-y-2">
                    <div className="flex justify-between font-bold text-sm">
                      <span className="text-default-700">ຮ້ານ:</span>
                      <span className="text-primary">{tableData?.store?.name}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm">
                      <span className="text-default-700">ໂຕ໊ະ:</span>
                      <span className="text-primary">{tableData?.name}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary font-bold w-full">
              ກະລຸນາກັບມາບັດໃໝ່ເມື່ອມີໂອກາດ
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* ปุ่มตะกร้าลอยมุมล่างขวา (Floating Cart Button) */}
      <div className="fixed bottom-6 right-6 z-40 animate-in zoom-in duration-300">
        <Badge 
          content={cartTotalItems + (placedOrders?.length || 0)} 
          color="danger" 
          shape="circle" 
          placement="top-right" 
          size="lg" 
          className="border-none font-bold shadow-md"
          isInvisible={(cartTotalItems + (placedOrders?.length || 0)) === 0}
        >
          <Button
            isIconOnly
            color="primary"
            variant="shadow"
            size="lg"
            className="w-16 h-16 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-transform hover:scale-105"
            onPress={onOpenCart}
          >
            <ShoppingCart size={28} className="text-white" />
          </Button>
        </Badge>
      </div>

      {/* หน้าต่างป๊อปอัปตระกร้าสินค้า (Cart Modal) */}
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
