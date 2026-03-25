import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Select, SelectItem, Chip, Progress, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User } from "@heroui/react";
import DateRangePickerComponent from "@/components/common/date-range-picker";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  TrendingUp,
  CircleDollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  CreditCard,
  Banknote,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { formatNumber } from "@/utils/numberFormat";

interface DateRange {
  start: any;
  end: any;
}

// Mock data for the POS Dashboard
const salesTrendData = [
  { day: "ຈັນ", revenue: 4500000, cost: 3000000 },
  { day: "ອັງຄານ", revenue: 5200000, cost: 3400000 },
  { day: "ພຸດ", revenue: 4800000, cost: 3100000 },
  { day: "ພະຫັດ", revenue: 6100000, cost: 4000000 },
  { day: "ສຸກ", revenue: 7500000, cost: 5000000 },
  { day: "ເສາະ", revenue: 8900000, cost: 5800000 },
  { day: "ອາທິດ", revenue: 8200000, cost: 5400000 },
];

const bestSellers = [
  { id: 1, name: "ຕຳໝາກຫຸ່ງ", price: 25000, sold: 145, image: "https://images.unsplash.com/photo-1623824231964-185b8c3b1638?w=100&h=100&fit=crop" },
  { id: 2, name: "ລາບງົວ", price: 45000, sold: 98, image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=100&h=100&fit=crop" },
  { id: 3, name: "ແກງໜໍ່ໄມ້", price: 35000, sold: 86, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop" },
  { id: 4, name: "ປີ້ງໄກ່", price: 55000, sold: 72, image: "https://images.unsplash.com/photo-1598103442097-8b74394b85c3?w=100&h=100&fit=crop" },
];

const paymentStats = [
  { name: "ເງິນສົດ", value: 12500000, color: "#22c55e", icon: <Banknote size={20} /> },
  { name: "BCEL One", value: 8400000, color: "#3b82f6", icon: <CreditCard size={20} /> },
  { name: "LDB", value: 2100000, color: "#9333ea", icon: <CreditCard size={20} /> },
  { name: "ອື່ນໆ", value: 1200000, color: "#94a3b8", icon: <CreditCard size={20} /> },
];

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, change, changeType, icon, color }: StatCardProps) => {
  return (
    <Card className="p-5 border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-default-50 overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 bg-${color}`} />
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <p className="text-sm font-medium text-default-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{formatNumber(value)}</h3>
          <div className="flex items-center gap-1.5">
            <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full ${
              changeType === "increase" ? "bg-success-50 text-success" : "bg-danger-50 text-danger"
            }`}>
              {changeType === "increase" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {change}
            </span>
            <span className="text-xs text-default-400">ທຽບກັບມື້ວານ</span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl bg-${color}/10 text-${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const totalSales = useMemo(() => salesTrendData.reduce((acc, curr) => acc + curr.revenue, 0), []);
  const totalCost = useMemo(() => salesTrendData.reduce((acc, curr) => acc + curr.cost, 0), []);
  const totalProfit = totalSales - totalCost;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-3">
            <LayoutDashboard size={32} />
            ແຜງຄວບຄຸມ
          </h1>
          <p className="text-default-500 mt-1 font-medium">ສະຫຼຸບຂໍ້ມູນການຂາຍ ແລະ ຜົນປະກອບການທັງໝົດ</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-default-50 p-2 rounded-2xl shadow-sm border border-divider">
          <DateRangePickerComponent
            value={dateRange}
            onChange={setDateRange}
            label=""
            color="primary"
          />
          <Button isIconOnly variant="flat" color="primary" className="rounded-xl">
             <TrendingUp size={20} />
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="ກຳໄລທັງໝົດ"
          value={12450000}
          change="+15.4%"
          changeType="increase"
          icon={<CircleDollarSign size={24} />}
          color="success"
        />
        <StatCard
          title="ລາຍຈ່າຍທັງໝົດ"
          value={8200000}
          change="+2.1%"
          changeType="increase"
          icon={<ArrowDownRight size={24} />}
          color="danger"
        />
        <StatCard
          title="ຍອດຂາຍເງິນສົດ"
          value={paymentStats[0].value}
          change="+12.5%"
          changeType="increase"
          icon={<Wallet size={24} />}
          color="primary"
        />
        <StatCard
          title="ຈຳນວນພະນັກງານ"
          value={8}
          change="+1"
          changeType="increase"
          icon={<Users size={24} />}
          color="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 p-6 border-none shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold">ທ່າອ່ຽງລາຍຮັບ</h3>
              <p className="text-sm text-default-400 font-medium">ສະຖິຕິການຂາຍໃນ 7 ວັນຜ່ານມາ</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-default-500">ລາຍຮັບ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400" />
                <span className="text-xs font-bold text-default-500">ຕົ້ນທຶນ</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(val) => `${val/1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [formatNumber(value) + " ກີບ"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#f472b6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-6 border-none shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-1">ຊ່ອງທາງການຊຳລະ</h3>
          <p className="text-sm text-default-400 font-medium mb-6">ແບ່ງຕາມປະເພດການຮັບເງິນ</p>
          
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatNumber(value) + " ກີບ"} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-bold text-default-400 uppercase">ລວມທັງໝົດ</span>
              <span className="text-xl font-black text-primary">{formatNumber(totalSales)}</span>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {paymentStats.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-white`} style={{ backgroundColor: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-default-500">{item.name}</p>
                    <p className="text-sm font-bold">{formatNumber(item.value)} ກີບ</p>
                  </div>
                </div>
                <span className="text-xs font-black text-default-400">
                  {((item.value / totalSales) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best Selling Table */}
        <Card className="lg:col-span-2 p-0 border-none shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-white dark:bg-default-50 border-b border-divider">
            <div>
              <h3 className="text-lg font-bold">ເມນູຂາຍດີ</h3>
              <p className="text-sm text-default-400 font-medium tracking-tight">ລາຍການສິນຄ້າທີ່ໄດ້ຮັບຄວາມນິຍົມສູງສຸດ</p>
            </div>
            <Button color="primary" variant="flat" size="sm" className="font-bold">ເບິ່ງທັງໝົດ</Button>
          </div>
          <Table 
            aria-label="Best selling products table" 
            removeWrapper 
            className="p-2"
          >
            <TableHeader>
              <TableColumn>ສິນຄ້າ</TableColumn>
              <TableColumn className="text-center">ຈຳນວນທີ່ຂາຍ</TableColumn>
              <TableColumn className="text-right">ລາຄາ</TableColumn>
              <TableColumn className="text-right">ຍອດຂາຍລວມ</TableColumn>
            </TableHeader>
            <TableBody>
              {bestSellers.map((product) => (
                <TableRow key={product.id} className="border-b border-divider last:border-none">
                  <TableCell>
                    <User
                      name={product.name}
                      description="ອາຫານລາວ"
                      avatarProps={{
                        src: product.image,
                        className: "w-10 h-10 object-cover rounded-xl"
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Chip size="sm" color="primary" variant="flat" className="font-bold">
                       {product.sold} ຈານ
                    </Chip>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(product.price)} ກີບ
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {formatNumber(product.price * product.sold)} ກີບ
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Quick Stats & Overall Summary */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-sm bg-primary text-white overflow-hidden relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white/20">
                <Package size={20} />
              </div>
              <h3 className="font-bold">ເມນູທັງໝົດໃນຮ້ານ</h3>
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black">124</h2>
              <p className="text-white/60 text-sm font-medium leading-relaxed">ມີການເພີ່ມເມນູໃໝ່ 5 ລາຍການໃນເດືອນນີ້</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">ພ້ອມຂາຍ</span>
                <span className="font-black">118</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-80">ໝົດຊົ່ວຄາວ</span>
                <span className="font-black">6</span>
              </div>
              <Progress 
                value={95} 
                className="mt-2" 
                size="sm" 
                color="secondary"
                classNames={{ indicator: "bg-white" }}
              />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <h3 className="text-lg font-bold mb-4">ສະຫຼຸບເງິນໂອນ (ທະນາຄານ)</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-default-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    BCEL One
                  </span>
                  <span className="text-sm font-black">{formatNumber(8400000)}</span>
                </div>
                <Progress value={80} size="sm" color="primary" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-default-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    LDB
                  </span>
                  <span className="text-sm font-black">{formatNumber(2100000)}</span>
                </div>
                <Progress value={20} size="sm" color="secondary" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}