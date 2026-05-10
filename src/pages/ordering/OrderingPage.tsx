import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Divider,
  Avatar,
  AvatarGroup,
} from "@heroui/react";
import { Receipt, User, ShoppingCart, ChevronRight } from "lucide-react";

import { useCart } from "@/provider";
import { useGetTables } from "@/services/table/useTable";
import { useAuth } from "@/routes/AuthContext";
import { formatNumber } from "@/utils/numberFormat";
import EmptyState from "@/components/common/empty-state";
import { getDisplayImageUrl } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "warning";
    case "COOKING":
      return "primary";
    case "SERVED":
      return "success";
    case "CANCEL":
      return "danger";
    default:
      return "default";
  }
};

export default function OrderingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeId = user?.user?.storeId;
  const { carts, dismissedCarts, dismissTable } = useCart();
  const { data: tablesResponse } = useGetTables(storeId);
  const tables = tablesResponse?.data || [];

  const activeOrders = useMemo(() => {
    return Object.entries(carts)
      .map(([tableId, items]) => {
        if (tableId === "default") return null;
        const table = tables.find((t: any) => t.id === tableId);
        const snapshot = dismissedCarts[tableId]; // { [itemId]: qty } or undefined

        const pendingItems = items.filter((i) => i.status === "PENDING");

        let displayItems: typeof pendingItems;

        if (!snapshot) {
          // Never dismissed → show ALL pending items
          displayItems = pendingItems;
        } else {
          // Dismissed → show only items that are NEW or quantity increased
          displayItems = pendingItems
            .map((item) => {
              const seenQty = snapshot[item.id] || 0;
              const newQty = item.quantity - seenQty;

              if (newQty <= 0) return null;

              return { ...item, quantity: newQty };
            })
            .filter(Boolean) as typeof pendingItems;
        }

        if (displayItems.length === 0) return null;

        const totalAmount = displayItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const totalItems = displayItems.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        return {
          tableId,
          tableName: table?.name || "Unknown",
          capacity: table?.capacity,
          items: displayItems,
          totalAmount,
          totalItems,
          pendingCount: displayItems.length,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.pendingCount - a.pendingCount) as Array<{
      tableId: string;
      tableName: string;
      capacity: number;
      items: any[];
      totalAmount: number;
      totalItems: number;
      pendingCount: number;
    }>;
  }, [carts, tables, dismissedCarts]);

  const handleGoToTable = (tableId: string) => {
    navigate(`/table?tableId=${tableId}`);
  };

  return (
    <div className="space-y-8 pb-8 m-4">
      {/* Header Section - Matched with OrderPage style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Receipt size={28} />
            {t("ordering.title")}
          </h1>
          <p className="text-default-500">{t("ordering.desc")}</p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 pl-5 rounded-2xl border border-divider shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider font-bold text-default-400">
              {t("ordering.totalActive")}
            </span>
            <span className="text-xl font-black text-primary leading-none">
              {activeOrders.length}
            </span>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <ShoppingCart size={20} />
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {activeOrders.length === 0 ? (
          <div className="mt-20">
            <EmptyState
              description={t("ordering.noOrdersDesc")}
              message={t("ordering.noOrders")}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeOrders.map((order) => (
              <Card
                key={order.tableId}
                isPressable
                className="border border-divider shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                onPress={() => handleGoToTable(order.tableId)}
              >
                <CardBody className="p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Table Badge */}
                    <div className="flex items-center gap-4 min-w-[120px]">
                      <div className="relative">
                        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                          {order.tableName}
                        </div>
                        {order.pendingCount > 0 && (
                          <div className="absolute -top-1.5 -right-1.5 min-w-6 h-6 px-1 bg-warning text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            {order.pendingCount > 99
                              ? "99+"
                              : order.pendingCount}
                          </div>
                        )}
                      </div>
                      <div className="md:hidden flex-grow">
                        <h3 className="font-bold text-lg text-default-800">
                          {t("ordering.table")} {order.tableName}
                        </h3>
                        <div className="flex items-center gap-1 text-default-400 text-xs font-bold uppercase tracking-wider">
                          <User size={12} /> {order.capacity}{" "}
                          {t("ordering.seats")}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Table Info */}
                    <div className="hidden md:flex flex-col min-w-[140px]">
                      <h3 className="font-bold text-lg text-default-800 tracking-tight">
                        {t("ordering.table")} {order.tableName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-default-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                        <User size={12} />{" "}
                        <span>
                          {order.capacity} {t("ordering.seats")}
                        </span>
                      </div>
                    </div>

                    <Divider
                      className="hidden md:block h-10 mx-2 opacity-50"
                      orientation="vertical"
                    />

                    {/* Order Details - Items Summary */}
                    <div className="flex-grow flex flex-col md:flex-row md:items-center gap-4 overflow-hidden">
                      <div className="flex flex-col gap-1.5 max-w-[450px]">
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 5).map((item, idx) => (
                            <Chip
                              key={`${item.id}-${idx}`}
                              className="font-bold text-[10px] h-6"
                              color={getStatusColor(item.status)}
                              size="sm"
                              variant="flat"
                            >
                              {item.name} x{item.quantity}{item.unitName ? ` ${item.unitName}` : ""}
                            </Chip>
                          ))}
                          {order.items.length > 5 && (
                            <Chip
                              className="font-bold text-[10px] h-6"
                              color="default"
                              size="sm"
                              variant="dot"
                            >
                              +{order.items.length - 5} {t("ordering.items")}
                            </Chip>
                          )}
                        </div>
                      </div>

                      <div className="hidden xl:flex flex-col items-center justify-center ml-auto px-6 border-l border-divider h-10">
                        <AvatarGroup isBordered max={3} size="sm">
                          {(order.items as any[]).map((item, idx) => (
                            <Avatar
                              key={idx}
                              className="w-8 h-8"
                              src={getDisplayImageUrl(item.image)}
                            />
                          ))}
                        </AvatarGroup>
                      </div>
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-3 md:min-w-[280px] ml-auto">
                      <div className="text-right">
                        <p className="text-[10px] text-default-400 font-bold uppercase tracking-widest leading-tight">
                          {t("ordering.total")}
                        </p>
                        <p className="text-xl font-bold text-primary tracking-tight leading-tight">
                          {formatNumber(order.totalAmount)}
                          <span className="text-[10px] ml-1 font-bold opacity-60">
                            {t("ordering.kip")}
                          </span>
                        </p>
                      </div>

                      <Divider
                        className="h-8 mx-1 hidden sm:block opacity-30"
                        orientation="vertical"
                      />

                      <div className="flex items-center gap-2">
                        <Button
                          className="font-bold text-xs px-4"
                          color="danger"
                          size="sm"
                          variant="flat"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissTable(order.tableId);
                          }}
                        >
                          {t("ordering.dismiss")}
                        </Button>

                        <div className="w-10 h-10 bg-default-50 rounded-full flex items-center justify-center text-default-300 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <ChevronRight
                            className="group-hover:translate-x-0.5 transition-transform"
                            size={20}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
