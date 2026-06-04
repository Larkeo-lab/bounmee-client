import { Card } from "@heroui/card";
import { Users, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

import { formatNumber } from "@/utils/numberFormat";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  percent?: number; // แสดงเป็น % ต่อท้ายตัวเลข (ถ้ามี)
  qty?: number; // แสดงเป็น x จำนวน ต่อท้ายตัวเลข (ถ้ามี)
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  percent,
  qty,
}: StatCardProps) => {
  const colorClasses: Record<string, string> = {
    success: "bg-success/10 text-success bg-success",
    danger: "bg-danger/10 text-danger bg-danger",
    primary: "bg-primary/10 text-primary bg-primary",
    warning: "bg-warning/10 text-warning bg-warning",
  };

  const selectedClasses =
    colorClasses[color] || "bg-default-100 text-default-500 bg-default-500";

  return (
    <Card className="p-3 md:p-5 border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-default-50 overflow-hidden relative">
      <div
        className={clsx(
          "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10",
          selectedClasses.split(" ")[2],
        )}
      />
      <div className="flex justify-between items-start gap-2 relative z-10">
        <div className="space-y-1 md:space-y-2 min-w-0">
          <p className="text-xs md:text-sm font-medium text-default-500 line-clamp-2">
            {title}
          </p>
          <h3 className="text-lg md:text-2xl font-bold tracking-tight break-words">
            {formatNumber(value)}
            {qty !== undefined && (
              <span className="text-sm md:text-base font-bold text-default-400 ml-1.5">
                x {formatNumber(qty)}
              </span>
            )}
            {percent !== undefined && (
              <span className="text-sm md:text-base font-bold text-default-400 ml-1.5">
                | {percent.toFixed(1)} %
              </span>
            )}
          </h3>
        </div>
        <div
          className={clsx(
            "shrink-0 p-2 md:p-3 rounded-xl md:rounded-2xl",
            selectedClasses.split(" ").slice(0, 2).join(" "),
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface SummaryProps {
  summary: any;
  storeType: string;
}

export default function SummarySection({ summary, storeType }: SummaryProps) {
  const { t } = useTranslation();

  // กำไรสุทธิ (หักมูลค่าของแถม) + % กำไรเทียบยอดขาย
  const netProfit = (summary?.totalProfit || 0) - (summary?.totalFree || 0);
  const profitPercent = summary?.totalSales
    ? (netProfit / summary.totalSales) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-5">
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
        {storeType === "PHONE_SHOP" && (
          <>
            <StatCard
              color="danger"
              icon={
                <span className="font-black text-lg">{t("dashboard.kip")}</span>
              }
              title={t("dashboard.totalRepairCost") || "ຄ່າຊ້ອມທັງໝົດ"}
              value={summary?.totalFixPrice || 0}
            />
            <StatCard
              color="warning"
              icon={
                <span className="font-black text-lg">{t("dashboard.kip")}</span>
              }
              qty={summary?.amoutFree || 0}
              title={t("dashboard.totalFree") || "ມູນຄ່າຂອງແຖມທັງໝົດ"}
              value={summary?.totalFree || 0}
            />
          </>
        )}

        <StatCard
          color="primary"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          percent={profitPercent}
          title={t("dashboard.totalProfit")}
          value={netProfit}
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
          title={storeType === "RESTAURANT" ? t("dashboard.totalMenus") : t("dashboard.totalProducts")}
          value={summary?.totalMenu || 0}
        />
      </div>

      {/* Financial Breakdown Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard
          color="danger"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("order.discount") || "ສ່ວນຫຼຸດທັງໝົດ"}
          value={summary?.totalDiscount || 0}
        />
        <StatCard
          color="danger"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("order.debtAmount") || "ຍອດຕິດໜີ້ລວມ"}
          value={summary?.totalDebt || 0}
        />
        <StatCard
          color="success"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("order.paymentCash") || "ເງິນສົດລວມ"}
          value={summary?.totalCash || 0}
        />
        <StatCard
          color="primary"
          icon={
            <span className="font-black text-lg">{t("dashboard.kip")}</span>
          }
          title={t("order.paymentTransfer") || "ເງິນໂອນລວມ"}
          value={summary?.totalTransfer || 0}
        />


      </div>
    </div>
  );
}
