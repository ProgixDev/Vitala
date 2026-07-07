"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Package,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    title: "Total Users",
    value: "40,689",
    icon: Users,
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    trend: { value: "8.5%", isPositive: true, label: "Up from yesterday" },
  },
  {
    title: "Active Providers",
    value: "1,200",
    icon: Package,
    iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    trend: { value: "1.3%", isPositive: true, label: "Up from past week" },
  },
  {
    title: "Total Earnings",
    value: "$89,000",
    icon: DollarSign,
    iconBg: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    trend: { value: "4.3%", isPositive: false, label: "Down from yesterday" },
  },
  {
    title: "Pending Requests",
    value: "2040",
    icon: Clock,
    iconBg: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    trend: { value: "1.8%", isPositive: true, label: "Up from yesterday" },
  },
];

const ongoingAppointments = [
  {
    time: "08:00:00",
    patient: "Jullu Jalal",
    service: "STD",
    provider: "Jane Cooper",
    status: "Approve",
    address: "2476 90th Avenue, Drumheller",
    payment: "Visa",
  },
  {
    time: "09:30:00",
    patient: "Sarah Johnson",
    service: "Consultation",
    provider: "Dr. Smith",
    status: "Pending",
    address: "1234 Main Street, Calgary",
    payment: "Mastercard",
  },
  {
    time: "11:00:00",
    patient: "Mike Wilson",
    service: "Check-up",
    provider: "Nurse Brown",
    status: "Approve",
    address: "5678 Oak Road, Edmonton",
    payment: "Cash",
  },
];

const chartData = [
  { month: "Jan", services: 15000 },
  { month: "Feb", services: 28000 },
  { month: "Mar", services: 42000 },
  { month: "Apr", services: 38000 },
  { month: "May", services: 64365 },
  { month: "Jun", services: 32000 },
  { month: "Jul", services: 48000 },
  { month: "Aug", services: 58000 },
  { month: "Sep", services: 62000 },
  { month: "Oct", services: 48000 },
  { month: "Nov", services: 52000 },
  { month: "Dec", services: 56000 },
];

const chartConfig = {
  services: {
    label: "Services",
    color: "hsl(var(--chart-1))",
  },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.trend.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.trend.label}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Provided Services</CardTitle>
              <CardDescription>Monthly service overview</CardDescription>
            </div>
            <select className="px-3 py-1.5 text-sm border rounded-lg bg-background">
              <option>Yearly display</option>
              <option>Monthly display</option>
              <option>Weekly display</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={chartData}
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
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="services"
                type="natural"
                fill="var(--color-services)"
                fillOpacity={0.4}
                stroke="var(--color-services)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ongoing</CardTitle>
            </div>
            <select className="px-3 py-1.5 text-sm border rounded-lg bg-background">
              <option>October</option>
              <option>November</option>
              <option>December</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Provider&apos;s name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ongoingAppointments.map((appointment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {appointment.time}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.patient}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    >
                      {appointment.service}
                    </Badge>
                  </TableCell>
                  <TableCell>{appointment.provider}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        appointment.status === "Approve"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        appointment.status === "Approve"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : ""
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{appointment.address}</TableCell>
                  <TableCell>{appointment.payment}</TableCell>
                  <TableCell>
                    <button className="p-1 hover:bg-muted rounded">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
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
