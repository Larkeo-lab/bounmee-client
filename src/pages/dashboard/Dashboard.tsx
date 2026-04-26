import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import {
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ScrollShadow,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import clsx from "clsx";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  today,
  getLocalTimeZone,
  startOfMonth,
  endOfMonth,
  CalendarDate,
} from "@internationalized/date";
import dayjs from "dayjs";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  TrendingUp,
  LayoutDashboard,
  Package,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

import { formatNumber } from "@/utils/numberFormat";
import DateRangePickerComponent from "@/components/common/date-range-picker";
import { getDisplayImageUrl } from "@/lib/utils";
import { useAuth } from "@/routes";
import { useDashboard } from "@/services/dashboard/useDashboard";
import EmptyState from "@/components/common/empty-state";

interface DateRange {
  start: any;
  end: any;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    success: "bg-success/10 text-success bg-success",
    danger: "bg-danger/10 text-danger bg-danger",
    primary: "bg-primary/10 text-primary bg-primary",
    warning: "bg-warning/10 text-warning bg-warning",
  };

  const selectedClasses =
    colorClasses[color] || "bg-default-100 text-default-500 bg-default-500";

  return (
    <Card className="p-5 border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-default-50 overflow-hidden relative">
      <div
        className={clsx(
          "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10",
          selectedClasses.split(" ")[2],
        )}
      />
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <p className="text-sm font-medium text-default-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">
            {formatNumber(value)}
          </h3>
        </div>
        <div
          className={clsx(
            "p-3 rounded-2xl",
            selectedClasses.split(" ").slice(0, 2).join(" "),
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

// ... (existing helper components)

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | null>({
    start: startOfMonth(today(getLocalTimeZone())),
    end: endOfMonth(today(getLocalTimeZone())),
  });

  // Format dates for API
  const startDate = useMemo(() => {
    if (!dateRange?.start) return undefined;
    const { year, month, day } = dateRange.start;

    return format(new Date(year, month - 1, day), "yyyy-MM-dd");
  }, [dateRange]);

  const endDate = useMemo(() => {
    if (!dateRange?.end) return undefined;
    const { year, month, day } = dateRange.end;

    return format(new Date(year, month - 1, day), "yyyy-MM-dd");
  }, [dateRange]);

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = useDashboard({
    storeId: user?.user?.storeId || "",
    startDate,
    endDate,
  });

  // Refetch when entering the page
  useEffect(() => {
    refetch();
  }, []);

  const summary = dashboard?.summary;
  const revenueTrend = useMemo(() => {
    return (
      dashboard?.revenueTrend.map((item) => ({
        day: item.label,
        revenue: item.totalSales,
        cost: item.totalExpenses,
        profit: item.totalProfit,
      })) || []
    );
  }, [dashboard]);

  const totalCash = useMemo(() => {
    return (
      dashboard?.paymentChannel.find((p) => p.method === "CASH")?.totalSales ||
      0
    );
  }, [dashboard]);

  const totalTransfer = useMemo(() => {
    return (
      dashboard?.paymentChannel
        .filter((p) => p.method !== "CASH")
        .reduce((sum, item) => sum + item.totalSales, 0) || 0
    );
  }, [dashboard]);

  const paymentStatsMapped = useMemo(() => {
    return [
      { name: "Cash", value: totalCash, color: "#22c55e" },
      { name: "Transfer", value: totalTransfer, color: "#3b82f6" },
    ];
  }, [totalCash, totalTransfer]);

  const transfersByBank = useMemo(() => {
    return (
      dashboard?.paymentChannel
        .filter((p) => p.method !== "CASH")
        .map((p) => {
          let name = p.method;

          if (p.method === "TRANSFER") name = t("dashboard.transfer");
          if (p.method === "TRANSFER_CASH") name = t("dashboard.cashTransfer");

          return {
            name,
            total: p.totalSales,
            logoUrl: p.logoUrl,
          };
        }) || []
    );
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Progress
          isIndeterminate
          aria-label="Loading..."
          className="max-w-md"
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-3">
            <LayoutDashboard size={32} />
            {t("dashboard.title")}
          </h1>
          <p className="text-default-500 mt-1 font-medium">
            {t("dashboard.desc")}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-default-50 p-2 rounded-2xl shadow-sm border border-divider">
          <DateRangePickerComponent
            color="primary"
            label=""
            value={dateRange}
            onChange={setDateRange}
          />
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                className="font-bold min-w-[120px] rounded-xl h-10"
                color="primary"
                size="sm"
                startContent={<Filter size={18} />}
                variant="flat"
              >
                ຕົວຕອງດ່ວນ
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label={t("dashboard.filterAria")}
              onAction={(key: any) => {
                const todayVal = dayjs().format("YYYY-MM-DD");
                let start = todayVal;
                let end = todayVal;

                switch (key) {
                  case "today":
                    start = todayVal;
                    break;
                  case "yesterday":
                    start = dayjs().subtract(1, "day").format("YYYY-MM-DD");
                    end = start;
                    break;
                  case "3days":
                    start = dayjs().subtract(2, "day").format("YYYY-MM-DD");
                    break;
                  case "7days":
                    start = dayjs().subtract(6, "day").format("YYYY-MM-DD");
                    break;
                  case "1month":
                    start = dayjs().subtract(1, "month").format("YYYY-MM-DD");
                    break;
                  case "1year":
                    start = dayjs().subtract(1, "year").format("YYYY-MM-DD");
                    break;
                }

                const [sy, sm, sd] = start.split("-").map(Number);
                const [ey, em, ed] = end.split("-").map(Number);

                setDateRange({
                  start: new CalendarDate(sy, sm, sd),
                  end: new CalendarDate(ey, em, ed),
                });
              }}
            >
              <DropdownItem
                key="today"
                startContent={
                  <div className="w-2 h-2 rounded-full bg-success" />
                }
              >
                {t("dashboard.today")}
              </DropdownItem>
              <DropdownItem key="yesterday">
                {t("dashboard.yesterday")}
              </DropdownItem>
              <DropdownItem key="3days">
                {t("dashboard.last3Days")}
              </DropdownItem>
              <DropdownItem key="7days">
                {t("dashboard.last7Days")}
              </DropdownItem>
              <DropdownItem key="1month">
                {t("dashboard.lastMonth")}
              </DropdownItem>
              <DropdownItem key="1year">{t("dashboard.lastYear")}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button
            isIconOnly
            className="rounded-xl"
            color="primary"
            variant="flat"
          >
            <TrendingUp size={20} />
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <StatCard
          color="success"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("dashboard.totalSales")}
          value={summary?.totalSales || 0}
        />
        <StatCard
          color="danger"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("dashboard.totalExpenses")}
          value={summary?.totalExpenses || 0}
        />
        <StatCard
          color="primary"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("dashboard.totalProfit")}
          value={summary?.totalProfit || 0}
        />
        <StatCard
          color="warning"
          icon={<Users size={24} />}
          title={t("dashboard.totalEmployees")}
          value={summary?.totalEmployee || 0}
        />
        <StatCard
          color="warning"
          icon={<Package size={24} />}
          title={t("dashboard.totalMenus")}
          value={summary?.totalMenu || 0}
        />
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Revenue Trend - Full Width */}
        <Card className="p-6 border-none shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">
                {t("dashboard.revenueTrend")}
              </h3>
              <p className="text-sm text-default-400 font-medium">
                {t("dashboard.salesStats")}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-default-500">
                  {t("dashboard.revenue")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400" />
                <span className="text-xs font-bold text-default-500">
                  {t("dashboard.cost")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs font-bold text-default-500">
                  {t("dashboard.profit")}
                </span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="day"
                  height={60}
                  interval={0}
                  tick={
                    {
                      fill: "#94a3b8",
                      fontSize: 10,
                      angle: -45,
                      textAnchor: "end",
                    } as any
                  }
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(val) => formatNumber(val)}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) => [
                    formatNumber(value) + " " + t("dashboard.kip"),
                  ]}
                />
                <Area
                  dataKey="revenue"
                  fill="url(#colorRevenue)"
                  fillOpacity={1}
                  name={t("dashboard.revenue")}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  type="monotone"
                />
                <Area
                  dataKey="cost"
                  fill="transparent"
                  name={t("dashboard.cost")}
                  stroke="#f472b6"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  type="monotone"
                />
                <Area
                  dataKey="profit"
                  fill="url(#colorProfit)"
                  fillOpacity={1}
                  name="ກຳໄລ"
                  stroke="#22c55e"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods - Full Width with Chart/Details split */}
        <Card className="p-8 border-none shadow-sm flex flex-col ring-1 ring-divider/50">
          <div>
            <h3 className="text-xl font-bold mb-1">
              {t("dashboard.paymentChannels")}
            </h3>
            <p className="text-sm text-default-400 font-medium mb-4">
              {t("dashboard.paymentTypeDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Chart Area - 5 columns */}
            <div className="lg:col-span-5 relative h-64">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={paymentStatsMapped}
                    dataKey="value"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {paymentStatsMapped.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatNumber(value) + " ກີບ"}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-bold text-default-600">
                        {value === "Cash" ? "ເງິນສົດ" : "ເງິນໂອນ"}
                      </span>
                    )}
                    iconType="circle"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
                  ລວມທັງໝົດ
                </span>
                <span className="text-2xl font-black text-primary">
                  {formatNumber(summary?.totalSales || 0)}
                </span>
              </div>
            </div>

            {/* Details Area - 7 columns */}
            <div className="lg:col-span-7">
              <ScrollShadow
                className="max-h-[320px] overflow-y-auto pr-4"
                isEnabled={false}
                size={20}
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-base p-3 rounded-2xl bg-success/5 border border-success/10">
                    <span className="flex items-center gap-3 font-semibold text-success">
                      <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      ເງິນສົດ (Cash)
                    </span>
                    <span className="font-black text-lg">
                      {formatNumber(totalCash)}{" "}
                      <span className="text-sm font-medium">ກີບ</span>
                    </span>
                  </div>

                  {transfersByBank.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-base p-3 rounded-2xl bg-primary/5 border border-primary/10">
                        <span className="flex items-center gap-3 font-semibold text-primary">
                          <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                          ເງິນໂອນລວມ
                        </span>
                        <span className="font-black text-lg">
                          {formatNumber(totalTransfer)}{" "}
                          <span className="text-sm font-medium">ກີບ</span>
                        </span>
                      </div>

                      <ScrollShadow
                        className="max-h-[180px] overflow-y-auto pr-2 space-y-3 pl-4 border-l-2 border-primary/20 ml-1.5"
                        isEnabled={false}
                        size={20}
                      >
                        {transfersByBank.map((bank: any) => (
                          <div
                            key={bank.name}
                            className="flex items-center justify-between p-3 rounded-xl bg-default-50 border border-divider"
                          >
                            <div className="flex items-center gap-3">
                              {bank.logoUrl ? (
                                <Image
                                  className="w-8 h-8 rounded-full object-cover border border-divider"
                                  src={getDisplayImageUrl(bank.logoUrl)}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-default-400" />
                                </div>
                              )}
                              <span className="text-sm font-bold text-default-600">
                                {bank.name}
                              </span>
                            </div>
                            <span className="font-bold text-sm text-default-700">
                              {formatNumber(bank.total)}
                            </span>
                          </div>
                        ))}
                      </ScrollShadow>
                    </div>
                  )}
                </div>
              </ScrollShadow>
            </div>
          </div>
        </Card>

        {/* Best Selling Table - Full Breadth */}
        <Card className="p-0 border-none shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-white dark:bg-default-50 border-b border-divider">
            <div>
              <h3 className="text-lg font-bold">ເມນູຂາຍດີ</h3>
              <p className="text-sm text-default-400 font-medium tracking-tight">
                ລາຍການສິນຄ້າທີ່ໄດ້ຮັບຄວາມນິຍົມສູງສຸດ
              </p>
            </div>
          </div>
          <Table
            removeWrapper
            aria-label="Best selling products table"
            className="p-2"
          >
            <TableHeader>
              <TableColumn>ລຳດັບ</TableColumn>
              <TableColumn>ຮູບພາບ</TableColumn>
              <TableColumn>ຊື່ເມນູ</TableColumn>
              <TableColumn className="text-center">ຈຳນວນທີ່ຂາຍ</TableColumn>
              <TableColumn className="text-center">ລາຍລະອຽດ</TableColumn>
              <TableColumn className="text-right">ລາຄາ</TableColumn>
              <TableColumn className="text-right">ຍອດຂາຍລວມ</TableColumn>
            </TableHeader>
            <TableBody emptyContent={<EmptyState />}>
              {(dashboard?.topSellingProducts || []).map((product, index) => (
                <TableRow
                  key={index}
                  className="border-b border-divider last:border-none"
                >
                  <TableCell className="font-bold text-default-400">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Image
                      alt={product.name}
                      className="w-12 h-12 min-w-[48px] object-cover rounded-xl shadow-sm border border-divider/50"
                      src={getDisplayImageUrl(product.image || "")}
                    />
                  </TableCell>
                  <TableCell className="font-bold whitespace-nowrap">
                    {product.name || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Chip
                      className="font-bold"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      {product.qty}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.description ? product.description : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap">
                    {product.qty > 0
                      ? formatNumber(product.totalSales / product.qty)
                      : 0}{" "}
                    ກີບ
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                    {formatNumber(product.totalSales)} ກີບ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
