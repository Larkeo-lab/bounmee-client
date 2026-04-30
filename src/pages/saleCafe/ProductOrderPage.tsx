import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Input,
  Badge,
  ScrollShadow,
  Tabs,
  Tab,
  useDisclosure,
} from "@heroui/react";
import { Search, Plus, ShoppingCart, Barcode, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import { OrderRight } from "./orderRight";

import EmptyState from "@/components/common/empty-state";
import { useCart } from "@/provider";
import PaymentModal from "@/components/common/payment-modal";
import ConfirmModal from "@/components/common/popup-confirm";
import { useAuth } from "@/routes/AuthContext";
import { useGetCategories, Category } from "@/services/category/useCategory";
import {
  useGetProducts,
  Product,
  getProductByBarcode,
} from "@/services/product/useProduct";
import { getDisplayImageUrl } from "@/lib/utils";
import { socket } from "@/lib/socket";
import { formatNumber } from "@/utils/numberFormat";

interface FlyingItem {
  id: string;
  src: string;
  startX: number;
  startY: number;
}

export default function ProductOrderPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    isOpen: isPaymentOpen,
    onOpen: onPaymentOpen,
    onOpenChange: onPaymentOpenChange,
  } = useDisclosure();
  const [isMinimized, setIsMinimized] = useState(true);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    subtotal,
    setActiveTableId,
  } = useCart();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCartItems, setSelectedCartItems] = useState<string[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    status: string;
    note?: string;
  } | null>(null);
  const {
    isOpen: isRemoveItemOpen,
    onOpen: onRemoveItemOpen,
    onOpenChange: onRemoveItemOpenChange,
  } = useDisclosure();
  const {
    isOpen: isClearCartOpen,
    onOpen: onClearCartOpen,
    onOpenChange: onClearCartOpenChange,
  } = useDisclosure();

  useEffect(() => {
    setActiveTableId(null);
  }, [setActiveTableId]);

  // Sync selection with cart
  useEffect(() => {
    setSelectedCartItems((prev) =>
      prev.filter((uId) =>
        cart.some(
          (item) => `${item.id}-${item.status}-${item.note || ""}` === uId,
        ),
      ),
    );
  }, [cart]);

  const toggleNote = (uId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);

      if (next.has(uId)) next.delete(uId);
      else next.add(uId);

      return next;
    });
  };

  const filteredCart = useMemo(() => {
    return cart.filter((item) => {
      if (statusFilter === "ALL") return true;
      const itemStatus = item.status?.toUpperCase() || "PENDING";

      return itemStatus === statusFilter;
    });
  }, [cart, statusFilter]);

  const statusTotals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        const s = item.status?.toUpperCase() || "PENDING";

        if (s !== "CANCEL") {
          acc[s] = (acc[s] || 0) + item.price * item.quantity;
        }

        return acc;
      },
      { PENDING: 0, COOKING: 0, SERVED: 0 } as Record<string, number>,
    );
  }, [cart]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (!user?.user?.storeId) return;
    if (!socket.connected) socket.connect();
    const onConnect = () => socket.emit("JOIN:STORE", user.user.storeId);
    const onScanned = (product: Product) => {
      addToCart(product);
      toast.success(t("sale.barcodeAdded", { name: product.name }), {
        duration: 1000,
      });
    };

    socket.on("SETUP", onConnect);
    socket.on("PRODUCT:SCANNED", onScanned);
    if (socket.connected) onConnect();

    return () => {
      socket.off("SETUP", onConnect);
      socket.off("PRODUCT:SCANNED", onScanned);
    };
  }, [user?.user?.storeId, addToCart, t]);

  const { data: categoryResponse } = useGetCategories(
    user?.user?.storeId || "",
  );
  const {
    data: productResponse,
    refetch: refetchProducts,
    isPending: isLoadingProducts,
  } = useGetProducts(
    user?.user?.storeId || "",
    selectedCategory === "all" ? undefined : selectedCategory,
    true,
    debouncedSearch,
  );

  const products = productResponse?.data || [];

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode || !user?.user?.storeId) return;
    try {
      const product = await getProductByBarcode(barcode, user.user.storeId);

      if (product) {
        addToCart(product);
        setSearchQuery("");
      }
    } catch (error) {
      setDebouncedSearch(barcode);
    }
  };

  const handleAddToCart = (product: Product, event: any) => {
    addToCart(product);

    // Get position from event target
    const target = event?.target as HTMLElement;

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const newItem: FlyingItem = {
      id: Math.random().toString(36).substring(7),
      src: getDisplayImageUrl(product.image),
      startX: rect.left,
      startY: rect.top,
    };

    setFlyingItems((prev) => [...prev, newItem]);
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 1000);
  };

  const categories = [
    { id: "all", label: t("sale.categoryAll") },
    ...(categoryResponse?.data?.map((cat: Category) => ({
      id: cat.id,
      label: cat.name,
    })) || []),
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-0 lg:gap-4 overflow-hidden sm:m-4 relative">
      <div className="flex-grow flex flex-col min-h-0 lg:h-full">
        {/* Header */}
        <div className="flex flex-col gap-2 lg:gap-4 bg-white dark:bg-gray-800 p-2 lg:p-4 rounded-xl shadow-sm border-b lg:border border-divider z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg lg:hidden">
              <LayoutGrid className="text-primary" size={20} />
            </div>
            <div className="flex-grow">
              <Input
                isClearable
                className="w-full lg:max-w-[400px]"
                endContent={<Barcode className="text-default-400" size={18} />}
                placeholder={t("sale.searchPlaceholder")}
                size="sm"
                startContent={<Search className="text-default-400" size={18} />}
                value={searchQuery}
                variant="bordered"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBarcodeSearch(searchQuery);
                }}
                onValueChange={setSearchQuery}
              />
            </div>
            <div className="font-black text-lg text-primary lg:block hidden">
              Dee POS
            </div>
            <Badge
              className="lg:hidden"
              color="danger"
              content={cart.length}
              isInvisible={cart.length === 0}
              shape="circle"
              size="md"
            >
              <div
                className="p-2 bg-primary/10 rounded-full cursor-pointer"
                onClick={() => setIsMinimized(false)}
              >
                <ShoppingCart className="text-primary" size={22} />
              </div>
            </Badge>
          </div>

          <ScrollShadow
            hideScrollBar
            className="max-w-full w-0 min-w-full overflow-x-auto scrollbar-hide"
            orientation="horizontal"
            size={40}
          >
            <Tabs
              aria-label="Product Categories"
              classNames={{
                tabList:
                  "gap-4 lg:gap-6 flex-nowrap p-0 min-w-max border-b-2 border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-1 h-10 lg:h-12 flex-shrink-0",
                tabContent:
                  "group-data-[selected=true]:text-primary font-medium text-xs lg:text-sm whitespace-nowrap",
              }}
              color="primary"
              selectedKey={selectedCategory}
              variant="underlined"
              onSelectionChange={(key) => setSelectedCategory(key as string)}
            >
              {categories.map((cat) => (
                <Tab key={cat.id} title={cat.label} />
              ))}
            </Tabs>
          </ScrollShadow>
        </div>

        {/* Product Grid Area */}
        <div
          className={clsx(
            "flex-grow overflow-y-auto scrollbar-hide p-3 lg:p-1 transition-all duration-300",
            cart.length > 0 && !isMinimized
              ? "pb-[45vh] lg:pb-1"
              : "pb-[80px] lg:pb-1",
          )}
        >
          {!isLoadingProducts && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <EmptyState
                description={t("sale.emptyProductsDesc")}
                message={t("sale.emptyProducts")}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 lg:gap-4">
              {products.map((product) => {
                const cartQty = cart
                  .filter((i) => i.id === product.id && i.status !== "CANCEL")
                  .reduce((sum, i) => sum + i.quantity, 0);

                const remainingStock = Math.max(0, (product.stockQty || 0) - cartQty);
                const isOutOfStock = remainingStock <= 0;

                return (
                  <Card
                    key={product.id}
                    isPressable
                    className={clsx(
                      "group relative border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
                      isOutOfStock && "opacity-60 grayscale-[0.5]",
                    )}
                    isDisabled={isOutOfStock}
                    onPress={(e) => handleAddToCart(product, e as any)}
                  >
                    <CardBody className="p-0 relative overflow-hidden h-[100px] sm:h-[120px] lg:h-[140px]">
                      <div className="absolute top-1.5 right-1.5 z-20">
                        <div
                          className={clsx(
                            "px-2 py-0.5 rounded-full text-[9px] lg:text-[10px] font-bold text-white shadow-lg backdrop-blur-md",
                            remainingStock > 10
                              ? "bg-green-500/80"
                              : remainingStock > 0
                                ? "bg-orange-500/80"
                                : "bg-red-500/80",
                          )}
                        >
                          {remainingStock > 0
                            ? `${remainingStock}`
                            : t("sale.outOfStock")}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                        <div className="bg-white/90 text-primary rounded-full p-2 lg:p-3 shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                          <Plus size={24} strokeWidth={3} />
                        </div>
                      </div>
                      <Image
                        alt={product.name}
                        className="w-full object-cover h-full group-hover:scale-110 transition-transform duration-500"
                        radius="none"
                        shadow="none"
                        src={getDisplayImageUrl(product.image)}
                        width="100%"
                      />
                    </CardBody>
                    <CardFooter className="flex flex-col items-start gap-0.5 p-2 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
                      <b className="text-[11px] lg:text-[12px] font-bold text-default-700 w-full truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </b>
                      <p className="text-primary font-black text-[12px] lg:text-[14px] whitespace-nowrap">
                        {formatNumber(product.price)}{" "}
                        <span className="text-[8px] lg:text-[9px] font-medium text-default-400">
                          {t("sale.kip")}
                        </span>
                      </p>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile Cart */}
      {cart.length > 0 && isMinimized && (
        <Button
          className="fixed bottom-6 right-6 lg:hidden z-50 rounded-full h-14 w-14 shadow-2xl animate-in zoom-in duration-300 min-w-0 p-0"
          color="primary"
          onClick={() => setIsMinimized(false)}
        >
          <Badge color="danger" content={cart.length} shape="circle" size="md">
            <ShoppingCart size={24} strokeWidth={2.5} />
          </Badge>
        </Button>
      )}

      {/* Cart Sidebar / Bottom Sheet */}
      <OrderRight
        expandedNotes={expandedNotes}
        filteredCart={filteredCart}
        isMinimized={isMinimized}
        selectedCartItems={selectedCartItems}
        setIsMinimized={setIsMinimized}
        setItemToRemove={setItemToRemove}
        setSelectedCartItems={setSelectedCartItems}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        statusTotals={statusTotals}
        toggleNote={toggleNote}
        onClearCartOpen={onClearCartOpen}
        onPaymentOpen={onPaymentOpen}
        onRemoveItemOpen={onRemoveItemOpen}
      />

      <PaymentModal
        businessType="CAFE"
        isOpen={isPaymentOpen}
        items={cart}
        total={subtotal}
        onOpenChange={onPaymentOpenChange}
        onPaymentSuccess={() => {
          clearCart();
          refetchProducts();
        }}
      />

      <ConfirmModal
        color="danger"
        isOpen={isRemoveItemOpen}
        message="ທ່ານຕ້ອງການລົບລາຍການນີ້ອອກຈາກກະຕ່າແທ້ຫຼືບໍ່?"
        title="ຢືນຢັນການລົບ?"
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(
              itemToRemove.id,
              itemToRemove.status,
              itemToRemove.note,
            );
            setItemToRemove(null);
          }
        }}
        onOpenChange={onRemoveItemOpenChange}
      />

      <ConfirmModal
        color="danger"
        isOpen={isClearCartOpen}
        message={t("sale.confirmClearMsg")}
        title={t("sale.confirmClear")}
        onConfirm={() => {
          clearCart();
        }}
        onOpenChange={onClearCartOpenChange}
      />

      {/* Flying Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              animate={{
                x:
                  window.innerWidth > 1024
                    ? window.innerWidth - 100
                    : window.innerWidth - 60,
                y:
                  window.innerWidth > 1024
                    ? window.innerHeight / 2
                    : window.innerHeight - 60,
                scale: 0.2,
                opacity: 0,
                rotate: 720,
              }}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 0.8,
                opacity: 1,
              }}
              style={{ position: "fixed", left: 0, top: 0 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary shadow-2xl bg-white p-1">
                <img
                  alt="flying"
                  className="w-full h-full object-cover rounded-xl"
                  src={item.src}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
