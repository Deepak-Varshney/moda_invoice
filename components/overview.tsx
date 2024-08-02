import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import axios from '@/utils/network';
import CircularLoader from './loader/circular';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from './ui/chart';

interface AggregatedData {
  name: string;
  total: number;
}

const fetchAggregatedData = async (): Promise<AggregatedData[]> => {
  try {
    const response = await axios.get<{
      message: string;
      data: AggregatedData[];
    }>('/api/invoices?aggregate=true');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    return [];
  }
};

export function Overview() {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const aggregatedData = await fetchAggregatedData();
        setData(aggregatedData);
      } catch (error) {
        setError('Failed to fetch aggregated data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-28">
        <CircularLoader />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }
  const chartConfig = {
    revenue: {
      label: 'Total',
      color: 'hsl(var(--chart-1))'
    }
  } satisfies ChartConfig;
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ChartContainer config={chartConfig}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹ ${value}`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
