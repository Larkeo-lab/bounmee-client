import { Card } from "@heroui/card";
import { Image, ScrollShadow } from "@heroui/react";
import { useTranslation } from "react-i18next";
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

import { formatNumber } from "@/utils/numberFormat";
import { getDisplayImageUrl } from "@/lib/utils";

interface ChartsSectionProps {
  revenueTrend: any[];
  paymentStatsMapped: any[];
  summary: any;
  totalCash: number;
  totalTransfer: number;
  totalDebt: number;
  transfersByBank: any[];
}

export default function ChartsSection({
  revenueTrend,
  paymentStatsMapped,
  summary,
  totalCash,
  totalTransfer,
  totalDebt,
  transfersByBank,
}: ChartsSectionProps) {
  const { t } = useTranslation();

  return (
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
                  formatter={(value) => {
                    if (value === "Cash") return t("order.paymentCash") || "ເງິນສົດ";
                    if (value === "Transfer") return t("order.paymentTransfer") || "ເງິນໂອນ";
                    if (value === "Debt") return t("order.debtAmount") || "ຍອດຕິດໜີ້";
                    return value;
                  }}
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

                {totalDebt > 0 && (
                  <div className="flex justify-between items-center text-base p-3 rounded-2xl bg-danger/5 border border-danger/10">
                    <span className="flex items-center gap-3 font-semibold text-danger">
                      <div className="w-3 h-3 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                      {t("order.debtAmount") || "ຍອດຕິດໜີ້"} (Debt)
                    </span>
                    <span className="font-black text-lg">
                      {formatNumber(totalDebt)}{" "}
                      <span className="text-sm font-medium">ກີບ</span>
                    </span>
                  </div>
                )}

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
    </div>
  );
}
