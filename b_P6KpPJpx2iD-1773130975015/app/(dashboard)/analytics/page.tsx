'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { mockTrades, mockCredits, mockSellOrders, getDashboardStats } from '@/lib/mock-data';
import { formatEthPrice } from '@/lib/eth-utils';

export default function AnalyticsPage() {
  const stats = getDashboardStats();

  // Process trades for price chart
  const priceData = useMemo(() => {
    return mockTrades
      .filter((t) => t.status === 'settled' && t.settled_at)
      .sort((a, b) => new Date(a.settled_at!).getTime() - new Date(b.settled_at!).getTime())
      .map((trade) => {
        const credit = mockCredits.find((c) => c.id === trade.credit_id);
        return {
          date: new Date(trade.settled_at!).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          price: parseFloat(trade.execution_price_eth),
          tonnage: credit?.metadata.co2_tonnage || 0,
          pricePerTon:
            credit?.metadata.co2_tonnage && credit.metadata.co2_tonnage > 0
              ? parseFloat(trade.execution_price_eth) / credit.metadata.co2_tonnage
              : 0,
        };
      });
  }, []);

  // Volume by day
  const volumeData = useMemo(() => {
    const volumeByDay: Record<string, { date: string; volume: number; count: number }> = {};

    mockTrades
      .filter((t) => t.status === 'settled' && t.settled_at)
      .forEach((trade) => {
        const date = new Date(trade.settled_at!).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!volumeByDay[date]) {
          volumeByDay[date] = { date, volume: 0, count: 0 };
        }
        volumeByDay[date].volume += parseFloat(trade.execution_price_eth);
        volumeByDay[date].count += 1;
      });

    return Object.values(volumeByDay).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, []);

  // Credit distribution by status
  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    mockCredits.forEach((credit) => {
      distribution[credit.status] = (distribution[credit.status] || 0) + 1;
    });
    return Object.entries(distribution).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
  }, []);

  // Calculate price trends
  const avgPrice =
    priceData.length > 0 ? priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length : 0;

  const latestPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : 0;
  const previousPrice = priceData.length > 1 ? priceData[priceData.length - 2].price : latestPrice;
  const priceChange = previousPrice > 0 ? ((latestPrice - previousPrice) / previousPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Price Analytics</h1>
        <p className="text-muted-foreground">
          Track carbon credit prices, trading volume, and market trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trade Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTradeVolume.toFixed(2)} ETH</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTraded} completed trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPrice.toFixed(3)} ETH</div>
            <p className="text-xs text-muted-foreground">Per credit token</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Price</CardTitle>
            {priceChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestPrice.toFixed(3)} ETH</div>
            <div className="flex items-center gap-1">
              <Badge variant={priceChange >= 0 ? 'default' : 'destructive'} className="text-xs">
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(1)}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs previous</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Credits available for purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>Execution price (ETH) over time for settled trades</CardDescription>
        </CardHeader>
        <CardContent>
          {priceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value} ETH`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value.toFixed(4)} ETH`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              No trade data available yet
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Volume</CardTitle>
            <CardDescription>Daily trading volume in ETH</CardDescription>
          </CardHeader>
          <CardContent>
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${value} ETH`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'volume' ? `${value.toFixed(4)} ETH` : value,
                      name === 'volume' ? 'Volume' : 'Trades',
                    ]}
                  />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No volume data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Status Distribution</CardTitle>
            <CardDescription>Current status of all carbon credits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="status"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value, 'Credits']}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Latest settled transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="py-3 text-left font-medium text-muted-foreground">Credit</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">CO2 Tonnage</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Price</th>
                  <th className="py-3 text-right font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTrades
                  .sort((a, b) => new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime())
                  .slice(0, 5)
                  .map((trade) => {
                    const credit = mockCredits.find((c) => c.id === trade.credit_id);
                    return (
                      <tr key={trade.id} className="border-b border-border last:border-0">
                        <td className="py-3 text-foreground">
                          {new Date(trade.matched_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-foreground">{credit?.metadata.name || 'Unknown'}</td>
                        <td className="py-3 text-right text-foreground">
                          {credit?.metadata.co2_tonnage || 0} tCO2e
                        </td>
                        <td className="py-3 text-right font-medium text-foreground">
                          {formatEthPrice(trade.execution_price_eth, 4)} ETH
                        </td>
                        <td className="py-3 text-right">
                          <Badge
                            variant={trade.status === 'settled' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {trade.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
