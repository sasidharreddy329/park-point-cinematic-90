import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Car,
  Settings,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarCheck, label: "My Bookings" },
  { icon: CreditCard, label: "Payments" },
  { icon: Car, label: "My Vehicles" },
  { icon: Settings, label: "Settings" },
];

const chartData = [
  { day: "Mon", bookings: 4 },
  { day: "Tue", bookings: 8 },
  { day: "Wed", bookings: 5 },
  { day: "Thu", bookings: 7 },
  { day: "Fri", bookings: 12 },
  { day: "Sat", bookings: 25 },
  { day: "Sun", bookings: 18 },
];

const statsCards = [
  { icon: CalendarCheck, label: "Total Bookings", value: "24", trend: "+12%", color: "bg-blue-100 text-blue-600" },
  { icon: Car, label: "Hours Parked", value: "48.5 hrs", trend: "", color: "bg-red-100 text-red-500" },
  { icon: CreditCard, label: "Total Spent", value: "$142.00", trend: "", color: "bg-green-100 text-green-600" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card min-h-[calc(100vh-5rem)] p-4">
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">P</span>
            </div>
            <span className="font-bold text-foreground">ParkPoint</span>
          </div>

          <nav className="space-y-1 flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-5xl">
            <p className="text-muted-foreground text-sm mb-1">Welcome back, Alex!</p>
            <h1 className="text-2xl font-bold text-foreground mb-8">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {statsCards.map((card) => (
                <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    {card.trend && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        {card.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Activity Chart */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-foreground">Current Activity</h2>
                <Link to="#" className="text-sm text-primary font-medium">View All</Link>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(228, 82%, 57%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(228, 82%, 57%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="hsl(228, 82%, 57%)"
                    strokeWidth={2}
                    fill="url(#colorBookings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
