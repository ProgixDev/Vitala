"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserPlus,
  MoreVertical,
  Mail,
  Phone,
  Award,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const nurses = [
  {
    id: 1,
    name: "Jane Cooper",
    email: "jane.cooper@vitala.com",
    phone: "+1 234 567 8900",
    specialization: "Critical Care",
    status: "active",
    experience: "8 years",
    avatar: null,
    rating: 4.9,
    completedAppointments: 245,
  },
  {
    id: 2,
    name: "Emily Davis",
    email: "emily.davis@vitala.com",
    phone: "+1 234 567 8901",
    specialization: "Pediatrics",
    status: "active",
    experience: "5 years",
    avatar: null,
    rating: 4.8,
    completedAppointments: 189,
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael.b@vitala.com",
    phone: "+1 234 567 8902",
    specialization: "Emergency",
    status: "on-duty",
    experience: "12 years",
    avatar: null,
    rating: 4.95,
    completedAppointments: 412,
  },
  {
    id: 4,
    name: "Sarah Anderson",
    email: "sarah.a@vitala.com",
    phone: "+1 234 567 8903",
    specialization: "General Care",
    status: "active",
    experience: "6 years",
    avatar: null,
    rating: 4.7,
    completedAppointments: 156,
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@vitala.com",
    phone: "+1 234 567 8904",
    specialization: "ICU",
    status: "off-duty",
    experience: "10 years",
    avatar: null,
    rating: 4.85,
    completedAppointments: 328,
  },
];

const statsCards = [
  {
    title: "Total Nurses",
    value: "48",
    description: "Active healthcare providers",
    icon: Award,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    title: "On Duty",
    value: "32",
    description: "Currently available",
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    title: "Total Appointments",
    value: "1,330",
    description: "This month",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    title: "Avg Rating",
    value: "4.82",
    description: "Overall satisfaction",
    icon: Award,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
];

const performanceData = [
  { nurse: "Jane C.", appointments: 245, rating: 4.9 },
  { nurse: "Emily D.", appointments: 189, rating: 4.8 },
  { nurse: "Michael B.", appointments: 412, rating: 4.95 },
  { nurse: "Sarah A.", appointments: 156, rating: 4.7 },
  { nurse: "David W.", appointments: 328, rating: 4.85 },
];

const performanceChartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-1))",
  },
};

export default function NursesPage() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "on-duty":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "off-duty":
        return "bg-gray-500 hover:bg-gray-600 text-white";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nurses</h1>
          <p className="text-muted-foreground mt-1">
            Manage nursing staff and their assignments
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Nurse
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nurse Performance</CardTitle>
          <CardDescription>
            Top performing nurses by completed appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={performanceChartConfig}
            className="h-[250px] w-full"
          >
            <BarChart
              data={performanceData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="nurse"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="appointments"
                fill="var(--color-appointments)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Nurses</CardTitle>
              <CardDescription>
                View and manage your nursing staff
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search nurses..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nurse</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Appointments</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nurses.map((nurse) => (
                <TableRow key={nurse.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={nurse.avatar || undefined} />
                        <AvatarFallback>
                          {getInitials(nurse.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{nurse.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {nurse.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {nurse.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {nurse.specialization}
                    </Badge>
                  </TableCell>
                  <TableCell>{nurse.experience}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={getStatusColor(nurse.status)}
                    >
                      {nurse.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {nurse.rating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{nurse.completedAppointments}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Assign Appointment</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Remove Nurse
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
