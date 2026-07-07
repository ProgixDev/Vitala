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
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 32000 },
  { month: "Feb", revenue: 52000, expenses: 35000 },
  { month: "Mar", revenue: 48000, expenses: 33000 },
  { month: "Apr", revenue: 61000, expenses: 38000 },
  { month: "May", revenue: 55000, expenses: 36000 },
  { month: "Jun", revenue: 67000, expenses: 41000 },
];

const userGrowthData = [
  { month: "Jan", users: 12400 },
  { month: "Feb", users: 15800 },
  { month: "Mar", users: 18200 },
  { month: "Apr", revenue: 22100 },
  { month: "May", users: 26500 },
  { month: "Jun", users: 30200 },
];

const appointmentData = [
  { day: "Mon", completed: 65, cancelled: 12, pending: 23 },
  { day: "Tue", completed: 72, cancelled: 8, pending: 18 },
  { day: "Wed", completed: 58, cancelled: 15, pending: 27 },
  { day: "Thu", completed: 81, cancelled: 6, pending: 13 },
  { day: "Fri", completed: 77, cancelled: 10, pending: 15 },
  { day: "Sat", completed: 45, cancelled: 5, pending: 8 },
  { day: "Sun", completed: 38, cancelled: 3, pending: 12 },
];

const serviceDistributionData = [
  { service: "Consultation", count: 245 },
  { service: "Check-up", count: 189 },
  { service: "Emergency", count: 156 },
  { service: "STD Testing", count: 134 },
  { service: "Vaccination", count: 98 },
];

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
};

const userChartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-3))",
  },
};

const appointmentChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(var(--chart-2))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
};

const serviceChartConfig = {
  count: {
    label: "Services",
    color: "hsl(var(--chart-4))",
  },
};

const stats = [
  {
    title: "Total Revenue",
    value: "$328,000",
    change: "+12.5%",
    icon: DollarSign,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    title: "Active Users",
    value: "30,200",
    change: "+8.2%",
    icon: Users,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Appointments",
    value: "822",
    change: "+5.7%",
    icon: Activity,
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Growth Rate",
    value: "23.8%",
    change: "+3.1%",
    icon: TrendingUp,
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View detailed analytics and insights
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Last 6 months comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={revenueChartConfig}
              className="h-[300px] w-full"
            >
              <AreaChart
                data={revenueData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="var(--color-revenue)"
                  fillOpacity={0.4}
                  stroke="var(--color-revenue)"
                  stackId="a"
                />
                <Area
                  dataKey="expenses"
                  type="natural"
                  fill="var(--color-expenses)"
                  fillOpacity={0.4}
                  stroke="var(--color-expenses)"
                  stackId="b"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total registered users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={userChartConfig}
              className="h-[300px] w-full"
            >
              <LineChart
                data={userGrowthData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="users"
                  type="natural"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-users)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Appointments</CardTitle>
            <CardDescription>
              Status breakdown for the current week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={appointmentChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                data={appointmentData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={4}
                />
                <Bar
                  dataKey="cancelled"
                  fill="var(--color-cancelled)"
                  radius={4}
                />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Most requested services</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={serviceChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart
                data={serviceDistributionData}
                layout="vertical"
                margin={{
                  left: 0,
                  right: 12,
                }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="service"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={100}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
