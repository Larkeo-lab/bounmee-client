import { Button } from "@heroui/button"
import { Card } from "@heroui/card"
import { Select, SelectItem } from "@heroui/react"
import DateRangePickerComponent from "@/components/common/date-range-picker"
import { useState } from "react"
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
  LineChart,
  Line,
} from "recharts"
import {
  Users,
  FileText,
  Briefcase,
  Building2,
  ClipboardCheck,
  Clock,
  UserX,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react"

interface DateRange {
  start: any
  end: any
}

// Mock data for charts
const yearlyRevenueData = [
  { year: "2020", income: 1500, expense: 800, profit: 700 },
  { year: "2021", income: 2000, expense: 1000, profit: 1000 },
  { year: "2022", income: 2500, expense: 1200, profit: 1300 },
  { year: "2023", income: 3000, expense: 1400, profit: 1600 },
  { year: "2024", income: 3500, expense: 1500, profit: 2000 },
  { year: "2025", income: 4000, expense: 1800, profit: 2200 },
]

const userStatsData = [
  { name: "1", users: 2800 },
  { name: "2", users: 2600 },
  { name: "3", users: 2900 },
  { name: "4", users: 2700 },
  { name: "5", users: 2800 },
  { name: "6", users: 2750 },
  { name: "7", users: 2650 },
  { name: "8", users: 2800 },
]

const userTypeData = [
  { name: "ຜູ້ໃຊ້ທີ່ໃຊ້ງານ", value: 1000, color: "#3b82f6" },
  { name: "ຜູ້ໃຊ້ບໍ່ໃຊ້ງານ", value: 247, color: "#f97316" },
]

const documentTrendData = [
  { day: "1", count: 140 },
  { day: "2", count: 155 },
  { day: "3", count: 145 },
  { day: "4", count: 160 },
  { day: "5", count: 175 },
  { day: "6", count: 180 },
  { day: "7", count: 185 },
]

const incomeData = [
  { name: "ລາຍໄດ້ປີ", value: 2000000, color: "#22c55e" },
  { name: "ລາຍຈາເດືອນຜ່ານມາ", value: 5460000, color: "#3b82f6" },
  { name: "ລາຍໄດ້ເດືອນນີ້", value: 18090000, color: "#ef4444" },
]

const ministryRankingData = [
  { name: "ກະຊວງພາຍໃນ", count: 1000, icon: "🏛️" },
  { name: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", count: 969, icon: "🛡️" },
  { name: "ກະຊວງການຕ່າງປະເທດ", count: 869, icon: "🌐" },
  { name: "ກະຊວງວັດທະນະທຳ", count: 769, icon: "🎭" },
  { name: "ກະຊວງກະສິກຳ ແລະ ສິ່ງແວດລ້ອມ", count: 669, icon: "🌿" },
]

const serviceRankingData = [
  { name: "ຟອມເຮັດບັດປະຈຳໂຕ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", count: 1569, icon: "📋" },
  { name: "ສຳມະໂນຄົວ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", count: 869, icon: "📝" },
  { name: "ຟອມເຮັດພາສະປ໋ອດເດີນທາງ", ministry: "ກະຊວງການຕ່າງປະເທດ", count: 482, icon: "✈️" },
  { name: "ຟອມແອກະສານວີຊ່າ", ministry: "ກະຊວງການຕ່າງປະເທດ", count: 152, icon: "📄" },
  { name: "ຟອມເຮັດພາສະປ໋ອດເດີນທາງ", ministry: "ກະຊວງພະລັງງານ", count: 52, icon: "⚡" },
]

const recentTransactions = [
  { id: "US0001", name: "ສົມມາ ສີພັນດີ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", service: "ເອກະສານພາສະປ໋ອດສະເພາະ", date: "7/10/2025" },
  { id: "US0002", name: "ສົມມາ ສີພັນດີ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", service: "ເອກະສານພາສະປ໋ອດສະເພາະ", date: "7/10/2025" },
  { id: "US0003", name: "ສົມມາ ສີພັນດີ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", service: "ເອກະສານພາສະປ໋ອດສະເພາະ", date: "7/10/2025" },
  { id: "US0003", name: "ສົມມາ ສີພັນດີ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", service: "ເອກະສານພາສະປ໋ອດສະເພາະ", date: "7/10/2025" },
  { id: "US0003", name: "ສົມມາ ສີພັນດີ", ministry: "ກະຊວງປ້ອງກັນຄວາມສະຫງົບ", service: "ເອກະສານພາສະປ໋ອດສະເພາະ", date: "7/10/2025" },
]

// Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  change: string
  changeType: "increase" | "decrease"
  icon: React.ReactNode
  variant?: "primary" | "default"
}

const StatCard = ({ title, value, change, changeType, icon, variant = "default" }: StatCardProps) => {
  const isPrimary = variant === "primary"
  return (
    <Card
      className={`p-4 ${isPrimary ? "bg-primary text-white" : "bg-white dark:bg-gray-800"}`}
      shadow="sm"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm ${isPrimary ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-1 ${isPrimary ? "text-white" : "text-gray-800 dark:text-white"}`}>
            {value}
          </p>
          <p className={`text-sm mt-2 flex items-center gap-1 ${
            changeType === "increase"
              ? isPrimary
                ? "text-blue-100"
                : "text-green-500"
              : "text-red-500"
          }`}>
            <TrendingUp className="w-4 h-4" />
            {change} ເພີ່ມຂຶ້ນ
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isPrimary ? "bg-primary" : "bg-gray-100 dark:bg-gray-700"}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [selectedMinistry, setSelectedMinistry] = useState<string>("")

  const handleDateRangeChange = (range: DateRange | null) => {
    setDateRange(range)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          ພາບລວມສະຖິຕິ
        </h1>

        <div className="flex items-center gap-3 ">
          <DateRangePickerComponent
            value={dateRange}
            onChange={handleDateRangeChange}
            label=""
            color="primary"
          />

          <Select
            placeholder="ເລືອກເບິ່ງຕາມລາຍປີ"
            className="w-40"
            selectedKeys={selectedMinistry ? [selectedMinistry] : []}
            onSelectionChange={(keys) => setSelectedMinistry(Array.from(keys)[0] as string)}
          >
            <SelectItem key="2025">2025</SelectItem>
            <SelectItem key="2024">2024</SelectItem>
            <SelectItem key="2023">2023</SelectItem>
          </Select>
        </div>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ຜູ້ໃຊ້ງານລະບົບ"
          value="755"
          change="+12%"
          changeType="increase"
          icon={<Users className="w-6 h-6 text-white" />}
          variant="primary"
        />
        <StatCard
          title="ຄຸນບໍລິການທັງໝົດ"
          value="512"
          change="+8%"
          changeType="increase"
          icon={<FileText className="w-6 h-6 text-gray-500" />}
        />
        <StatCard
          title="ບໍລິການທັງໝົດ"
          value="243"
          change="+7%"
          changeType="increase"
          icon={<Briefcase className="w-6 h-6 text-gray-500" />}
        />
        <StatCard
          title="ກະຊວງທັງໝົດ"
          value="15"
          change="+2%"
          changeType="increase"
          icon={<Building2 className="w-6 h-6 text-gray-500" />}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ຄຳເຫັນເອກະສານບໍ່ຜ່ານ"
          value="755"
          change="+10%"
          changeType="increase"
          icon={<ClipboardCheck className="w-6 h-6 text-gray-500" />}
        />
        <StatCard
          title="ສະບັບແລ້ວ"
          value="512"
          change="+12%"
          changeType="increase"
          icon={<FileText className="w-6 h-6 text-green-500" />}
        />
        <StatCard
          title="ລໍຖ້າສະບັບບໍ່ຜ່ານ"
          value="243"
          change="+1%"
          changeType="increase"
          icon={<Clock className="w-6 h-6 text-yellow-500" />}
        />
        <StatCard
          title="ແຮດມິນບໍ່ຜ່ານ"
          value="15"
          change="+3%"
          changeType="increase"
          icon={<UserX className="w-6 h-6 text-gray-500" />}
        />
      </div>

      {/* Ministry & Service Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ministry Ranking */}
        <Card className="p-6" shadow="sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            ກະຊວງທີ່ມີການໃຊ້ບໍລິການຫຼາຍທີ່ສຸດ
          </h3>
          <div className="space-y-4">
            {ministryRankingData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {item.count.toLocaleString()} ຄັ້ງ
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Service Ranking */}
        <Card className="p-6" shadow="sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            ບໍລິການໃຊ້ຫຼາຍສຸດ
          </h3>
          <div className="space-y-4">
            {serviceRankingData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.ministry}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {item.count.toLocaleString()} ຄັ້ງ
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue Section */}
      <Card className="p-6" shadow="sm">
        <div className="flex items-center gap-2 mb-6">
          <CircleDollarSign className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ສະຫຼຸບລາຍຮັບ</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">ສະຖິຕິລາຍຮັບ</h4>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {incomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} Kip`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {incomeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {item.value.toLocaleString()} Kip
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">ສະຖິຕິລາຍຮັບຈາກປີທີ່ຜ່ານມາ</h4>
              <Select placeholder="ປີ 2025" className="w-28" size="sm">
                <SelectItem key="2025">ປີ 2025</SelectItem>
                <SelectItem key="2024">ປີ 2024</SelectItem>
              </Select>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* User Access Statistics */}
      <Card className="p-6" shadow="sm">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">ສະຫຼຸບຈຳນວນການເຂົ້າໃຊ້ລະບົບ</h3>
        </div>

        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-none" shadow="none">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ຈຳນວນຜູ້ເຂົ້າໃຊ້ລະບົບ</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">1,247</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-none" shadow="none">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ຜູ້ເຂົ້າກູ້ໃຊ້ງານ</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">1,247</p>
              </div>
              <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700">
                <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-none" shadow="none">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ຜູ້ໃຊ້ບໍ່ໃຊ້ງານ</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">247</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <UserX className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* User Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">ສະຖິຕິຈຳນວນຜູ້ໃຊ້ງານລະບົບ</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStatsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">ສະຖິຕິຜູ້ໃຊ້ທີ່ຜ່ານມາ</h4>
              <Select placeholder="7 ວັນທີ່ແລ້ວ" className="w-32" size="sm">
                <SelectItem key="7">7 ວັນທີ່ແລ້ວ</SelectItem>
                <SelectItem key="30">30 ວັນທີ່ແລ້ວ</SelectItem>
              </Select>
            </div>
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {userTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Document Trend */}
      <Card className="p-6" shadow="sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          ຈຳນວນການແລເອກະສານ (7ວັນທີ່ຜ່ານມາ)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={documentTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis domain={[120, 210]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6" shadow="sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            ລາຍການແລເອກະສານລ່າສຸດ
          </h3>
          <Button color="primary" variant="light" size="sm">
            ເບິ່ງທັງໝົດ
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  ລະຫັດຜູ້ໃຊ້
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  ຊື່ຜູ້ໃຊ້ງານ
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  ກະຊວງ
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  ບໍລິການ
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  ວັນທີ່ແລເອກະສານ
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300">{item.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300">{item.ministry}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300">{item.service}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-300">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}