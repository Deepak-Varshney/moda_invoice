'use client';
import { useEffect, useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import CircularLoader from '@/components/loader/circular';
import { Overview } from '@/components/overview';
import { RecentSales } from '@/components/recent-sales';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Invoice {
  customer: Customer;
  _id: string;
  invoiceNumber: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
    _id: string;
  }>;
  totalAmount: number;
  totalQuantity: number;
  issueDate: string;
  __v: number;
}

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalSoldItems: number;
  averageItemPrice: number;
  recentSales: Invoice[];
}

const fetchDashboardData = async (
  startDate: string,
  endDate: string
): Promise<DashboardData> => {
  const res = await fetch(
    `/api/dashboard?startDate=${startDate}&endDate=${endDate}`,
    {
      cache: 'no-store'
    }
  );
  const data = await res.json();
  return data;
};

export default function Page() {
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalSoldItems: 0,
    averageItemPrice: 0,
    recentSales: []
  });
  const {
    totalRevenue,
    totalSales,
    totalCustomers,
    totalSoldItems,
    averageItemPrice,
    recentSales
  } = data;
  const [loading, setLoading] = useState<boolean>(true);

  const startDate = format(
    new Date(
      new URLSearchParams(window?.location.search).get('startDate') ||
        new Date()
    ),
    'yyyy-MM-dd'
  );

  const endDate = format(
    new Date(
      new URLSearchParams(window?.location.search).get('endDate') || new Date()
    ),
    'yyyy-MM-dd'
  );

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchDashboardData(startDate, endDate);
      setData(data);
      setLoading(false);
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
            <DateRangePicker />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <CircularLoader /> : `₹ ${totalRevenue}`}
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p> */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Invoice Counts
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <CircularLoader /> : `${totalSales}`}
                  </div>
                  {/* <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p> */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sold Items
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M20 7.5a2.5 2.5 0 0 1-2.5 2.5h-5m-5 0H4.5a2.5 2.5 0 0 1-2.5-2.5v-5a2.5 2.5 0 0 1 2.5-2.5h5m5 0h5.5a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5H15" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <CircularLoader /> : `${totalSoldItems}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total sold items count
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Item Price
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? (
                      <CircularLoader />
                    ) : (
                      `${averageItemPrice?.toFixed(2)}`
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average item sale price
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-4 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made {totalSales} sales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center p-4 py-24">
                      <CircularLoader />
                    </div>
                  ) : (
                    <RecentSales sales={recentSales} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
