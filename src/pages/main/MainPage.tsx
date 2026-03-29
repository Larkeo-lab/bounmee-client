import { useState, useEffect } from "react";
import clsx from "clsx";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Input,
  Badge,
  Divider,
  ScrollShadow,
  Tabs,
  Tab,
  useDisclosure,
  Kbd,
} from "@heroui/react";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  ReceiptText,
  Banknote,
  Trash2,
  Barcode,
} from "lucide-react";
import EmptyState from "@/components/common/empty-state";

import { useCart } from "@/provider";
import PaymentModal from "@/components/main/payment-modal";
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

export default function MainPage() {
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    setQuantity,
    clearCart,
    subtotal,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!user?.user?.storeId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log("Connected to scanning socket");
      socket.emit("JOIN:STORE", user.user.storeId);
    };

    const onScanned = (product: Product) => {
      console.log("Remote scan received:", product);
      addToCart(product);
    };

    socket.on("SETUP", onConnect);
    socket.on("PRODUCT:SCANNED", onScanned);

    // If already connected, join room manually
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("SETUP", onConnect);
      socket.off("PRODUCT:SCANNED", onScanned);
    };
  }, [user?.user?.storeId, addToCart]);

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
      // First, try to find an exact match for the barcode
      const product = await getProductByBarcode(barcode, user.user.storeId);
      if (product) {
        addToCart(product);
        setSearchQuery("");
        setDebouncedSearch("");
      }
    } catch (error) {
      // If no exact match (or error), fallback to normal filtering
      setDebouncedSearch(barcode);
    }
  };

  const categories = [
    { id: "all", label: "ທັງໝົດ" },
    ...(categoryResponse?.data?.map((cat: Category) => ({
      id: cat.id,
      label: cat.name,
    })) || []),
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-0 lg:gap-4 overflow-hidden -m-4">
      {/* Product Selection Section */}
      <div className="flex-grow flex flex-col min-h-0 lg:h-full p-4 lg:pb-4 pb-2">
        {/* Header with Search and Category Tabs */}
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-sm border border-divider">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Input
              isClearable
              className="w-full lg:max-w-[400px]"
              placeholder="ຄົ້ນຫາລາຍການ ຫຼື ຍິງບາໂຄດ..."
              startContent={<Search className="text-default-400" size={18} />}
              endContent={
                <div className="hidden sm:flex items-center gap-1">
                  <Kbd keys={["enter"]}></Kbd>
                  <Barcode className="text-default-400" size={18} />
                </div>
              }
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBarcodeSearch(searchQuery);
                }
              }}
              variant="bordered"
            />
            <div className="hidden sm:block flex-grow"></div>
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="font-bold text-xl text-primary sm:block">
                Dee POS
              </div>
              <Badge
                color="primary"
                content={cart.length}
                shape="circle"
                size="md"
                className="lg:hidden ml-4"
              >
                <ShoppingCart size={24} className="text-primary" />
              </Badge>
            </div>
          </div>

          <Tabs
            aria-label="Product Categories"
            color="primary"
            variant="underlined"
            selectedKey={selectedCategory}
            onSelectionChange={(key) => setSelectedCategory(key as string)}
            classNames={{
              tabList: "gap-4 lg:gap-6 overflow-x-auto",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-1 h-10 lg:h-12",
              tabContent:
                "group-data-[selected=true]:text-primary font-medium text-sm lg:text-base",
            }}
          >
            {categories.map((cat) => (
              <Tab key={cat.id} title={cat.label} />
            ))}
          </Tabs>
        </div>

        {/* Product Grid */}
        <ScrollShadow size={0} className="flex-grow p-1 mt-4">
          {!isLoadingProducts && products.length === 0 ? (
            <EmptyState
              message="ບໍ່ພົບລາຍການສິນຄ້າ"
              description="ລອງຄົ້ນຫາດ້ວຍຄຳສັບອື່ນ ຫຼື ປ່ຽນໝວດໝູ່"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
              {products.map((product) => (
                <Card
                  isPressable
                  key={product.id}
                  onPress={() => addToCart(product)}
                  className="group relative border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <CardBody className="p-0 relative overflow-hidden h-[130px] sm:h-[150px] lg:h-[160px]">
                    {/* Stock Indicator Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      <div
                        className={clsx(
                          "px-2 py-0.5 lg:py-1 rounded-full text-[9px] lg:text-[10px] font-bold text-white shadow-lg backdrop-blur-md",
                          product.stockQty > 10
                            ? "bg-green-500/80"
                            : product.stockQty > 0
                              ? "bg-orange-500/80"
                              : "bg-red-500/80",
                        )}
                      >
                        {product.stockQty > 0
                          ? `ຍັງເຫຼືອ: ${product.stockQty}`
                          : "ໝົດແລ້ວ"}
                      </div>
                    </div>

                    {/* Hover Overlay with Add Icon */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                      <div className="bg-white/90 text-primary rounded-full p-2 lg:p-3 shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <Plus size={20} strokeWidth={3} />
                      </div>
                    </div>

                    <Image
                      shadow="none"
                      radius="none"
                      width="100%"
                      alt={product.name}
                      className="w-full object-cover h-full group-hover:scale-110 transition-transform duration-500"
                      src={getDisplayImageUrl(product.image)}
                    />
                  </CardBody>

                  <CardFooter className="flex flex-col items-start gap-1 p-2 lg:p-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
                    <b className="text-[12px] lg:text-small font-bold text-default-700 w-full truncate mb-0.5 group-hover:text-primary transition-colors">
                      {product.name}
                    </b>
                    <div className="flex justify-between items-center w-full">
                      <p className="text-primary font-black text-sm lg:text-base whitespace-nowrap">
                        {formatNumber(product.price)}{" "}
                        <span className="text-[9px] lg:text-[10px] font-medium text-default-400">
                          ກີບ
                        </span>
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollShadow>
      </div>

      {/* Cart / Order Summary Section */}
      {cart.length > 0 && (
        <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-divider shadow-2xl z-30 h-[35vh] lg:h-full animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="p-3 lg:p-4 border-b border-divider flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-2 font-bold text-base lg:text-lg">
              <ShoppingCart size={18} className="text-primary" />
              <span>ລາຍການທີ່ເລືອກ</span>
            </div>
            <Badge
              color="primary"
              content={cart.length}
              shape="circle"
              size="md"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ReceiptText size={16} className="text-primary" />
              </div>
            </Badge>
          </div>

          {/* Cart Items List */}
          <ScrollShadow
            size={0}
            className="flex-grow p-3 lg:p-4 space-y-3 lg:space-y-4"
          >
            {cart.map((item) => (
              <div key={item.id} className="flex gap-2 lg:gap-3 group">
                <Image
                  src={getDisplayImageUrl(item.image)}
                  className="w-12 h-12 lg:w-16 lg:h-16 object-cover min-w-[48px] lg:min-w-[64px]"
                  radius="md"
                />
                <div className="flex-grow flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-[12px] lg:text-sm line-clamp-1">
                      {item.name}
                    </span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onClick={() => removeFromCart(item.id)}
                      className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold text-[12px] lg:text-sm">
                      {formatNumber(item.price * item.quantity)} ກີບ
                    </span>
                    <div className="flex ml-4 items-center gap-1.5 lg:gap-2 bg-default-100 rounded-lg p-0.5">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus size={10} />
                      </Button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity === 0 ? "" : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          if (val === "") {
                            // Optionally handle empty string if you want to allow clearing
                            // For now, let's just ignore it or set to 1 if blurred
                          }
                          setQuantity(item.id, val);
                        }}
                        onBlur={() => {
                          if (item.quantity === 0) {
                            setQuantity(item.id, "1");
                          }
                        }}
                        className="text-[11px] lg:text-xs font-bold w-6 lg:w-8 text-center bg-transparent outline-none focus:ring-1 focus:ring-primary/30 rounded"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="min-w-5 h-5 w-5 lg:min-w-6 lg:h-6 lg:w-6"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus size={10} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollShadow>

          {/* Totals and Actions */}
          <div className="p-3 lg:p-4 border-t border-divider bg-default-50">
            <div className="space-y-1 lg:space-y-2 mb-2 lg:mb-4 text-xs lg:text-sm">
              <div className="flex justify-between">
                <span className="text-default-500">ລວມ:</span>
                <span className="font-medium">
                  {subtotal.toLocaleString()} ກີບ
                </span>
              </div>
              <Divider className="my-1 lg:my-2" />
              <div className="flex justify-between items-center text-lg lg:text-xl font-bold">
                <span>ທັງໝົດ:</span>
                <span className="text-primary">
                  {subtotal.toLocaleString()} ກີບ
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <Button
                variant="flat"
                color="danger"
                className="h-10 lg:h-14 font-bold text-xs lg:text-base"
                onClick={clearCart}
                startContent={<Trash2 size={16} lg-size={20} />}
              >
                ຍົກເລີກ
              </Button>
              <Button
                color="primary"
                className="h-10 lg:h-14 font-bold text-sm lg:text-lg shadow-lg shadow-primary/30"
                startContent={<Banknote size={16} lg-size={20} />}
                onPress={onOpen}
                isDisabled={cart.length === 0}
              >
                ຕໍ່ໄປ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        total={subtotal}
        items={cart}
        onPaymentSuccess={() => {
          clearCart();
          refetchProducts();
        }}
      />
    </div>
  );
}
