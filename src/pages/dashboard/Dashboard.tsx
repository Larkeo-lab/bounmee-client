import { Button } from "@heroui/button";
import { Progress } from "@heroui/react";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { TrendingUp, LayoutDashboard } from "lucide-react";

import FilterDate from "@/components/common/fillterDate";
import { useAuth } from "@/routes";
import { useDashboard } from "@/services/dashboard/useDashboard";
import SummarySection from "./summary";
import ChartsSection from "./charts";
import UpcomingDebtsSection from "./upcomingDebts";
import BestSellingSection from "./bestSelling";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD"),
  );
  const storeType = user?.user?.store?.type;

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

  const totalCash = summary?.totalCash || 0;
  const totalTransfer = summary?.totalTransfer || 0;
  const totalDebt = summary?.totalDebt || 0;

  const paymentStatsMapped = useMemo(() => {
    const stats = [
      { name: "Cash", value: totalCash, color: "#22c55e" },
      { name: "Transfer", value: totalTransfer, color: "#3b82f6" },
    ];

    if (totalDebt > 0) {
      stats.push({ name: "Debt", value: totalDebt, color: "#ef4444" });
    }

    return stats;
  }, [totalCash, totalTransfer, totalDebt]);

  console.log('user', user.user.store.type)

  const transfersByBank = useMemo(() => {
    return (
      dashboard?.paymentChannel
        .filter((p) => p.method !== "CASH" && p.method !== "DEBT")
        .map((p) => {
          let name = p.method;

          if (p.method === "TRANSFER") name = t("dashboard.transfer");

          return {
            name,
            total: p.totalSales,
            logoUrl: p.logoUrl,
          };
        }) || []
    );
  }, [dashboard, t]);

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
          <FilterDate
            endDate={endDate}
            startDate={startDate}
            onEndDateChange={setEndDate}
            onFilter={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            onStartDateChange={setStartDate}
          />
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

      <SummarySection summary={summary} storeType={storeType} />

      <ChartsSection
        paymentStatsMapped={paymentStatsMapped}
        revenueTrend={revenueTrend}
        summary={summary}
        totalCash={totalCash}
        totalDebt={totalDebt}
        totalTransfer={totalTransfer}
        transfersByBank={transfersByBank}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UpcomingDebtsSection upcomingDebts={dashboard?.upcomingDebts || []} />
        <BestSellingSection
          topSellingProducts={dashboard?.topSellingProducts || []}
        />
      </div>
    </div>
  );
}
