"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const revenueData = [
  { value: 5000, normal: 25, emergencies: 18 },
  { value: 10000, normal: 35, emergencies: 28 },
  { value: 15000, normal: 48, emergencies: 35 },
  { value: 20000, normal: 42, emergencies: 30 },
  { value: 25000, normal: 55, emergencies: 45 },
  { value: 30000, normal: 52, emergencies: 48 },
  { value: 35000, normal: 75, emergencies: 58 },
  { value: 40000, normal: 68, emergencies: 52 },
  { value: 45000, normal: 62, emergencies: 48 },
  { value: 50000, normal: 58, emergencies: 42 },
  { value: 55000, normal: 68, emergencies: 55 },
  { value: 60000, normal: 82, emergencies: 72 },
];

const salesData = [
  { year: "2015", sales1: 25, sales2: 0 },
  { year: "2016", sales1: 45, sales2: 22 },
  { year: "2017", sales1: 68, sales2: 48 },
  { year: "2018", sales1: 52, sales2: 38 },
  { year: "2019", sales1: 85, sales2: 72 },
];

const customerData = [
  { name: "New Customers", value: 34249, color: "hsl(var(--chart-1))" },
  { name: "Repeated", value: 1420, color: "hsl(var(--chart-2))" },
];

const revenueChartConfig = {
  normal: {
    label: "Normal revenues",
    color: "hsl(15, 100%, 70%)",
  },
  emergencies: {
    label: "Emergencies",
    color: "hsl(270, 100%, 80%)",
  },
};

const salesChartConfig = {
  sales1: {
    label: "Sales 1",
    color: "hsl(210, 100%, 60%)",
  },
  sales2: {
    label: "Sales 2",
    color: "hsl(170, 100%, 50%)",
  },
};

const stats = [
  {
    title: "Total Revenue",
    value: "$892,450",
    change: "+12.5%",
    icon: DollarSign,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    title: "Transactions",
    value: "8,234",
    change: "+8.2%",
    icon: CreditCard,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Avg Transaction",
    value: "$108.40",
    change: "+3.7%",
    icon: TrendingUp,
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Active Customers",
    value: "35,669",
    change: "+15.3%",
    icon: Users,
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];

const recentTransactions = [
  {
    id: "TXN-001",
    customer: "John Doe",
    service: "Consultation",
    amount: "$120.00",
    status: "completed",
    date: "2024-01-15",
    method: "Credit Card",
  },
  {
    id: "TXN-002",
    customer: "Jane Smith",
    service: "Emergency Care",
    amount: "$450.00",
    status: "completed",
    date: "2024-01-15",
    method: "Insurance",
  },
  {
    id: "TXN-003",
    customer: "Mike Johnson",
    service: "Check-up",
    amount: "$85.00",
    status: "pending",
    date: "2024-01-14",
    method: "Debit Card",
  },
  {
    id: "TXN-004",
    customer: "Sarah Williams",
    service: "STD Testing",
    amount: "$200.00",
    status: "completed",
    date: "2024-01-14",
    method: "Credit Card",
  },
  {
    id: "TXN-005",
    customer: "David Brown",
    service: "Vaccination",
    amount: "$65.00",
    status: "failed",
    date: "2024-01-13",
    method: "Credit Card",
  },
];

export default function PaymentsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "failed":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "";
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage payment transactions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{stat.change}</span> from last
                month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>
                Revenue breakdown by service type
              </CardDescription>
            </div>
            <select className="px-3 py-1.5 text-sm border rounded-lg bg-background">
              <option>Yearly overview</option>
              <option>Monthly overview</option>
              <option>Weekly overview</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={revenueChartConfig}
            className="h-[400px] w-full"
          >
            <AreaChart
              data={revenueData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="value"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="emergencies"
                type="natural"
                fill="var(--color-emergencies)"
                fillOpacity={0.6}
                stroke="var(--color-emergencies)"
                stackId="a"
              />
              <Area
                dataKey="normal"
                type="natural"
                fill="var(--color-normal)"
                fillOpacity={0.6}
                stroke="var(--color-normal)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Customer acquisition breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-8 mt-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
                    <span className="text-sm text-muted-foreground">
                      New Customers
                    </span>
                  </div>
                  <span className="text-2xl font-bold">
                    {customerData[0].value.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                    <span className="text-sm text-muted-foreground">
                      Repeated
                    </span>
                  </div>
                  <span className="text-2xl font-bold">
                    {customerData[1].value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Year-over-year sales comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={salesChartConfig}
              className="h-[350px] w-full"
            >
              <LineChart
                data={salesData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="sales1"
                  type="natural"
                  stroke="var(--color-sales1)"
                  strokeWidth={3}
                  dot={{
                    fill: "var(--color-sales1)",
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
                <Line
                  dataKey="sales2"
                  type="natural"
                  stroke="var(--color-sales2)"
                  strokeWidth={3}
                  dot={{
                    fill: "var(--color-sales2)",
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.id}
                  </TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.service}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.amount}
                  </TableCell>
                  <TableCell>{transaction.method}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={getStatusColor(transaction.status)}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
