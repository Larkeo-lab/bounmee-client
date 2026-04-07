import React from "react";
import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { Plus } from "lucide-react";
import clsx from "clsx";
import EmptyState from "@/components/common/empty-state";
import { getDisplayImageUrl } from "@/lib/utils";
import { formatNumber } from "@/utils/numberFormat";
import { Product } from "@/services/product/useProduct";

interface MenuListProps {
  isLoadingProducts: boolean;
  products: Product[];
  selectedTable: any;
  addToCart: (product: Product) => void;
  cart: any[];
}

export const MenuList: React.FC<MenuListProps> = ({
  isLoadingProducts,
  products,
  selectedTable,
  addToCart,
  cart,
}) => {
  if (!isLoadingProducts && products.length === 0) {
    return (
      <EmptyState
        message="ບໍ່ພົບລາຍການສິນຄ້າ"
        description="ລອງຄົ້ນຫາດ້ວຍຄຳສັບອື່ນ"
      />
    );
  }

  return (
    <div
      className={clsx(
        "grid gap-2 lg:gap-3",
        selectedTable
          ? "grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          : "grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      )}
    >
      {products.map((product: Product) => {
        const cartQty = cart
          .filter((i) => i.id === product.id && i.status !== "CANCEL")
          .reduce((sum, i) => sum + i.quantity, 0);

        const isOutOfStock = (product.stockQty || 0) <= cartQty;

        return (
          <Card
            isPressable
            key={product.id}
            onPress={() => addToCart(product)}
            isDisabled={isOutOfStock}
            className={clsx(
              "group relative border-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 min-h-[110px] md:min-h-[130px] lg:min-h-[150px] flex flex-col",
              isOutOfStock && "opacity-60 grayscale-[0.5]",
            )}
          >
            <CardBody className="p-0 relative overflow-hidden flex-grow shrink">
              <div className="absolute top-2 right-2 z-20">
                <div
                  className={clsx(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-lg backdrop-blur-md",
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
            <CardFooter className="flex flex-col items-start gap-0 p-1.5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm">
              <b className="text-[11px] lg:text-xs font-bold text-default-700 w-full truncate group-hover:text-primary transition-colors">
                {product.name}
              </b>
              <div className="flex justify-between items-center w-full">
                <p className="text-primary font-black text-[11px] lg:text-xs whitespace-nowrap">
                  {formatNumber(product.price)}{" "}
                  <span className="text-[8px] lg:text-[9px] font-medium text-default-400">
                    ກີບ
                  </span>
                </p>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
