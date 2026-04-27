import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  ScrollShadow,
  Image,
  Divider,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import {
  ChefHat,
  Timer,
  Table as TableIcon,
  CheckCircle2,
  ShoppingCart,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/routes/AuthContext";
import { useGetTables } from "@/services/table/useTable";
import { useCart, CartItem } from "@/provider";
import EmptyState from "@/components/common/empty-state";
import { getDisplayImageUrl } from "@/lib/utils";

export default function KitchenPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const storeId = user?.user?.storeId;
  const { data: tablesResponse, isLoading: isLoadingTables } =
    useGetTables(storeId);
  const { carts, updateStatus, isConnected } = useCart();

  const tables = tablesResponse?.data || [];
  const [selectedView, setSelectedView] = useState<"table" | "item">("item");

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);

    return () => clearInterval(timer);
  }, []);

  const [isServing, setIsServing] = useState<string | null>(null);

  const getElapsedMinutes = (val?: string | number) => {
    if (!val) return 0;
    // In Thailand, server ISO strings might be interpreted correctly as UTC,
    // but we need to ensure we compare apples to apples (ms to ms).
    const past = new Date(val).getTime();

    if (isNaN(past)) return 0;

    // Use the state 'now' which is updated every minute
    return Math.floor(Math.max(0, now - past) / 60000);
  };

  // Get all cooking items across all tables
  const cookingOrdersByTable = useMemo(() => {
    const tableOrders: {
      tableId: string;
      tableName: string;
      items: CartItem[];
    }[] = [];

    Object.entries(carts).forEach(([tableId, items]) => {
      const cookingItems = items.filter((item) => item.status === "COOKING");

      if (cookingItems.length > 0) {
        const table = tables.find((t: any) => t.id === tableId);

        tableOrders.push({
          tableId,
          tableName: table?.name || t("kitchen.shopFloor"),
          items: cookingItems,
        });
      }
    });

    return tableOrders;
  }, [carts, tables]);

  const allCookingItems = useMemo(() => {
    const items: { tableId: string; tableName: string; item: CartItem }[] = [];

    cookingOrdersByTable.forEach((order) => {
      order.items.forEach((item) => {
        items.push({
          tableId: order.tableId,
          tableName: order.tableName,
          item,
        });
      });
    });

    return items;
  }, [cookingOrdersByTable]);

  const handleServeItem = (tableId: string, item: CartItem) => {
    if (!isConnected) {
      toast.error(t("kitchen.offlineWarning"), {
        duration: 4000,
        style: { fontWeight: "bold" },
      });
    }
    const uId = `${item.id}-${item.status}-${item.note || ""}-${tableId}`;

    if (isServing === uId) return;

    setIsServing(uId);

    try {
      updateStatus(
        [`${item.id}-${item.status}-${item.note || ""}`],
        "SERVED",
        tableId,
      );
      toast.success(t("kitchen.serveSuccess", { name: item.name }));
    } catch (error) {
      console.error("Failed to serve item:", error);
    } finally {
      // In practice, the item will be removed from the list,
      // but we reset state for safety if it fails.
      setTimeout(() => setIsServing(null), 500);
    }
  };

  const handleServeAllInTable = (tableId: string, items: CartItem[]) => {
    if (!isConnected) {
      toast.error(
        "⚠️ ຕອນนี้ Offline! ข้อมูลจะอับเดดไปยับเครื่องอื่นเมือเน็ตกลับมา.",
        {
          duration: 4000,
          style: { fontWeight: "bold" },
        },
      );
    }
    if (isServing === tableId) return;
    setIsServing(tableId);

    try {
      const ids = items.map(
        (item) => `${item.id}-${item.status}-${item.note || ""}`,
      );

      updateStatus(ids, "SERVED", tableId);
      toast.success(t("kitchen.serveAllSuccess"));
    } catch (error) {
      console.error("Failed to serve all items:", error);
    } finally {
      setTimeout(() => setIsServing(null), 500);
    }
  };

  if (isLoadingTables) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 overflow-hidden m-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
            <ChefHat className="w-8 h-8" />
            {t("kitchen.title")}
          </h1>
          <p className="text-sm text-default-500 font-medium ml-11">
            {t("kitchen.subtitle")}
          </p>
        </div>

        <Tabs
          color="primary"
          radius="full"
          selectedKey={selectedView}
          variant="solid"
          onSelectionChange={(key) => setSelectedView(key as any)}
        >
          <Tab
            key="table"
            title={
              <div className="flex items-center gap-2 px-2">
                <TableIcon size={16} />
                <span>{t("kitchen.viewByTable")}</span>
              </div>
            }
          />
          <Tab
            key="item"
            title={
              <div className="flex items-center gap-2 px-2">
                <ShoppingCart size={16} />
                <span>{t("kitchen.viewByItem")}</span>
              </div>
            }
          />
        </Tabs>
      </div>

      <ScrollShadow className="flex-grow pb-10">
        {cookingOrdersByTable.length === 0 ? (
          <div className="h-full mt-20">
            <EmptyState
              description={t("kitchen.emptyDescription")}
              message={t("kitchen.emptyState")}
            />
          </div>
        ) : selectedView === "table" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cookingOrdersByTable.map((order) => (
              <Card
                key={order.tableId}
                className="border-none shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md overflow-hidden"
              >
                <CardHeader className="bg-primary/10 px-4 py-3 flex justify-between items-center border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary text-white rounded-lg shadow-md">
                      <TableIcon size={16} />
                    </div>
                    <span className="font-black text-lg text-primary">
                      {t("kitchen.table")} {order.tableName}
                    </span>
                  </div>
                  <Chip
                    className="font-bold"
                    color="warning"
                    size="sm"
                    variant="flat"
                  >
                    {order.items.length} {t("kitchen.itemsCount")}
                  </Chip>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="divide-y divide-default-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${order.tableId}-${item.id}-${idx}`}
                        className="p-2.5 hover:bg-default-50 transition-colors group"
                      >
                        <div className="flex gap-2.5 items-start">
                          <Image
                            className="w-12 h-12 object-cover min-w-[48px] shadow-sm rounded-lg"
                            radius="none"
                            src={getDisplayImageUrl(item.image)}
                          />
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-sm text-default-800 line-clamp-1">
                                {item.name}
                              </h3>
                              <span className="bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded text-[10px]">
                                x{item.quantity}
                              </span>
                            </div>
                            {item.note && (
                              <div className="flex items-start gap-1.5 mb-1.5 px-2 py-1.5 bg-warning-50 border border-warning-100 rounded-lg">
                                <MessageSquare
                                  className="text-warning-600 shrink-0 mt-0.5"
                                  size={11}
                                />
                                <p className="text-[11px] text-warning-700 font-semibold leading-snug">
                                  {item.note}
                                </p>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-warning font-medium mb-2">
                              <Timer size={10} />
                              <span>
                                {t("kitchen.cookingWait")} (
                                {getElapsedMinutes(
                                  item.timestamp || (item as any).createdAt,
                                )}{" "}
                                {t("kitchen.minutes")})
                              </span>
                            </div>
                            <Button
                              fullWidth
                              className="font-bold text-success hover:bg-success hover:text-white transition-all"
                              color="success"
                              isLoading={
                                isServing ===
                                `${item.id}-${item.status}-${item.note || ""}-${order.tableId}`
                              }
                              size="sm"
                              startContent={<CheckCircle2 size={14} />}
                              variant="flat"
                              onPress={() =>
                                handleServeItem(order.tableId, item)
                              }
                            >
                              {t("kitchen.serve")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
                <Divider />
                <div className="p-4 bg-default-50/50">
                  <Button
                    fullWidth
                    className="font-bold shadow-lg"
                    color="primary"
                    isLoading={isServing === order.tableId}
                    startContent={<CheckCircle2 size={18} />}
                    onPress={() =>
                      handleServeAllInTable(order.tableId, order.items)
                    }
                  >
                    {t("kitchen.serveAll")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Table
            removeWrapper
            aria-label={t("kitchen.cookingList")}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-default-100"
            selectionMode="none"
          >
            <TableHeader>
              <TableColumn className="bg-primary/5 text-primary font-black uppercase tracking-wider">
                {t("kitchen.no")}
              </TableColumn>
              <TableColumn className="bg-primary/5 text-primary font-black uppercase tracking-wider">
                {t("kitchen.image")}
              </TableColumn>
              <TableColumn className="bg-primary/5 text-primary font-black uppercase tracking-wider">
                {t("kitchen.itemName")}
              </TableColumn>
              <TableColumn
                align="center"
                className="bg-primary/5 text-primary font-black uppercase tracking-wider"
              >
                {t("kitchen.table")}
              </TableColumn>
              <TableColumn
                align="center"
                className="bg-primary/5 text-primary font-black uppercase tracking-wider"
              >
                {t("kitchen.quantity")}
              </TableColumn>
              <TableColumn
                align="center"
                className="bg-primary/5 text-primary font-black uppercase tracking-wider"
              >
                {t("kitchen.note")}
              </TableColumn>
              <TableColumn
                align="center"
                className="bg-primary/5 text-primary font-black uppercase tracking-wider"
              >
                {t("kitchen.waitTime")}
              </TableColumn>
              <TableColumn
                align="center"
                className="bg-primary/5 text-primary font-black uppercase tracking-wider"
              >
                {t("kitchen.action")}
              </TableColumn>
            </TableHeader>
            <TableBody items={allCookingItems}>
              {(data) => {
                const idx = allCookingItems.indexOf(data);

                return (
                  <TableRow
                    key={`${data.tableId}-${data.item.id}-${idx}`}
                    className="border-b border-default-100 hover:bg-primary/5 transition-colors"
                  >
                    <TableCell className="font-bold text-default-400">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <Image
                        className="w-12 h-12 object-cover shadow-sm rounded-lg"
                        radius="none"
                        src={getDisplayImageUrl(data.item.image)}
                      />
                    </TableCell>
                    <TableCell className="font-bold text-default-800">
                      <div>
                        <p>{data.item.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 justify-center font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full text-xs">
                        <span>{data.tableName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <span className="bg-primary/10 text-primary font-black px-3 py-1 rounded-lg text-sm">
                          x{data.item.quantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1 mt-1 text-warning-600">
                        <span className="text-[11px] font-semibold">
                          {data.item.note}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5 text-sm text-warning font-black">
                        <Timer className="shrink-0" size={14} />
                        <span>
                          {getElapsedMinutes(
                            (data.item as any).createdAt || data.item.timestamp,
                          )}{" "}
                          {t("kitchen.minutes")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        className="font-bold text-success hover:bg-success hover:text-white transition-all w-full"
                        color="success"
                        isLoading={
                          isServing ===
                          `${data.item.id}-${data.item.status}-${data.item.note || ""}-${data.tableId}`
                        }
                        size="sm"
                        startContent={<CheckCircle2 size={16} />}
                        variant="flat"
                        onPress={() => handleServeItem(data.tableId, data.item)}
                      >
                        {t("kitchen.serve")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
        )}
      </ScrollShadow>
    </div>
  );
}
