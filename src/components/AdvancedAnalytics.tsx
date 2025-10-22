import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis } from "recharts";
import { TrendingUp, TrendingDown, Target, DollarSign, Clock, Calendar } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Trade {
  id: string;
  symbol: string;
  type: "long" | "short";
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  amount: number;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  riskToReward: string;
  strategy: string;
  notes: string;
  screenshot?: string;
  status: "open" | "closed";
}

interface TimeframeData {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface StrategyData {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
  color: string;
}

interface StrategyCombination {
  strategies: string[];
  totalPnL: number;
  avgPnL: number;
  winRate: number;
  trades: number;
}

interface TimeFramePerformance {
  timeFrame: string;
  strategy: string;
  pnl: number;
  trades: number;
  winRate: number;
}

interface AdvancedAnalyticsProps {
  trades: Trade[];
}

export const AdvancedAnalytics = ({ trades }: AdvancedAnalyticsProps) => {
  const { formatAmount } = useCurrency();
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

  // Daily Profitability Analysis
  const dailyProfitabilityData = useMemo(() => {
    const dailyData: { [key: string]: { pnl: number; trades: number; wins: number; losses: number } } = {};
    
    trades.forEach(trade => {
      const day = new Date(trade.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (!dailyData[day]) {
        dailyData[day] = { pnl: 0, trades: 0, wins: 0, losses: 0 };
      }
      dailyData[day].pnl += trade.pnl;
      dailyData[day].trades += 1;
      if (trade.pnl > 0) dailyData[day].wins += 1;
      else dailyData[day].losses += 1;
    });
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays.map(day => ({
      day,
      pnl: dailyData[day]?.pnl || 0,
      trades: dailyData[day]?.trades || 0,
      winRate: dailyData[day]?.trades ? (dailyData[day].wins / dailyData[day].trades) * 100 : 0,
      wins: dailyData[day]?.wins || 0,
      losses: dailyData[day]?.losses || 0
    })).filter(day => day.trades > 0);
  }, [trades]);

  // Time Frame Performance Analysis
  const timeFramePerformanceData = useMemo(() => {
    const timeFrameData: TimeFramePerformance[] = [];
    
    // Morning vs Evening performance
    const morningTrades = trades.filter(trade => {
      const startHour = parseInt(trade.startTime.split(':')[0]);
      return startHour >= 6 && startHour < 12;
    });
    
    const afternoonTrades = trades.filter(trade => {
      const startHour = parseInt(trade.startTime.split(':')[0]);
      return startHour >= 12 && startHour < 18;
    });
    
    const eveningTrades = trades.filter(trade => {
      const startHour = parseInt(trade.startTime.split(':')[0]);
      return startHour >= 18 || startHour < 6;
    });
    
    // Calculate performance for each time frame
    const calculatePerformance = (trades: Trade[], timeFrame: string) => {
      if (trades.length === 0) return null;
      
      const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
      const wins = trades.filter(t => t.pnl > 0).length;
      const winRate = (wins / trades.length) * 100;
      
      return {
        timeFrame,
        strategy: "All Strategies",
        pnl: totalPnL,
        trades: trades.length,
        winRate
      };
    };
    
    const morningPerf = calculatePerformance(morningTrades, "Morning (6AM-12PM)");
    const afternoonPerf = calculatePerformance(afternoonTrades, "Afternoon (12PM-6PM)");
    const eveningPerf = calculatePerformance(eveningTrades, "Evening (6PM-6AM)");
    
    if (morningPerf) timeFrameData.push(morningPerf);
    if (afternoonPerf) timeFrameData.push(afternoonPerf);
    if (eveningPerf) timeFrameData.push(eveningPerf);
    
    return timeFrameData;
  }, [trades]);

  // Strategy Combinations Analysis
  const strategyCombinationsData = useMemo(() => {
    // For simplicity, we'll analyze individual strategies and pairs
    const strategyMap: { [key: string]: { pnl: number; trades: number; wins: number } } = {};
    const combinationMap: { [key: string]: { pnl: number; trades: number; wins: number } } = {};
    
    trades.forEach(trade => {
      // Individual strategy performance
      if (!strategyMap[trade.strategy]) {
        strategyMap[trade.strategy] = { pnl: 0, trades: 0, wins: 0 };
      }
      strategyMap[trade.strategy].pnl += trade.pnl;
      strategyMap[trade.strategy].trades += 1;
      if (trade.pnl > 0) strategyMap[trade.strategy].wins += 1;
      
      // Strategy pairs (for demonstration, we'll create pairs with the next strategy in the array)
      // In a real implementation, this would be based on actual combination logic
    });
    
    // Convert to array format
    const individualStrategies = Object.entries(strategyMap).map(([strategy, data]) => ({
      strategies: [strategy],
      totalPnL: data.pnl,
      avgPnL: data.trades > 0 ? data.pnl / data.trades : 0,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      trades: data.trades
    }));
    
    return individualStrategies;
  }, [trades]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-muted-foreground">
              <span style={{ color: entry.color }}>{entry.name}: </span>
              <span className="font-semibold">
                {entry.dataKey === 'pnl' || entry.dataKey === 'totalPnL' || entry.dataKey === 'avgPnL' ? formatAmount(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Daily Profitability Analysis */}
      <Card className="bg-gradient-card shadow-card border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Daily Profitability Analysis</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">P&L by Day of Week</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyProfitabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatAmount(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Win Rate by Day of Week</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyProfitabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Win Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Daily Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {dailyProfitabilityData.map((day, index) => (
              <Card key={index} className="p-4 bg-card/50 border-border/50">
                <h5 className="font-semibold text-foreground text-center mb-2">{day.day.substring(0, 3)}</h5>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-bold ${day.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatAmount(day.pnl)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {day.winRate.toFixed(1)}% Win Rate
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.trades} trades
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Time Frame Performance Analysis */}
      <Card className="bg-gradient-card shadow-card border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Time Frame Performance Analysis</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">P&L by Trading Session</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeFramePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timeFrame" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatAmount(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Win Rate by Trading Session</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeFramePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timeFrame" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Session Performance Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timeFramePerformanceData.map((session, index) => (
              <Card key={index} className="p-4 bg-card/50 border-border/50">
                <h5 className="font-semibold text-foreground text-center mb-2">{session.timeFrame}</h5>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-bold ${session.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatAmount(session.pnl)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {session.winRate.toFixed(1)}% Win Rate
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.trades} trades
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Strategy Combinations Analysis */}
      <Card className="bg-gradient-card shadow-card border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Strategy Performance Analysis</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Strategy P&L Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strategyCombinationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="strategies" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatAmount(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalPnL" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Strategy Win Rate Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={strategyCombinationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="strategies" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="winRate" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Strategy Performance Metrics</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Strategy</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total P&L</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Avg P&L</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Win Rate</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Trades</th>
                </tr>
              </thead>
              <tbody>
                {strategyCombinationsData.map((strategy, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-foreground">{strategy.strategies.join(', ')}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-sm font-bold ${strategy.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatAmount(strategy.totalPnL)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-sm font-bold ${strategy.avgPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatAmount(strategy.avgPnL)}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`text-sm font-semibold ${strategy.winRate >= 50 ? 'text-success' : 'text-destructive'}`}>
                        {strategy.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-foreground">{strategy.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Comparative Metrics Summary */}
      <Card className="bg-gradient-card shadow-card border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Comparative Performance Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">Return on Investment (ROI)</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              ROI measures the efficiency of investments by comparing net profit to cost.
            </p>
            <div className="text-center">
              <span className="text-2xl font-bold text-success">
                {trades.length > 0 ? 
                  ((trades.reduce((sum, t) => sum + t.pnl, 0) / 
                    trades.reduce((sum, t) => sum + (t.entry * t.quantity), 0)) * 100).toFixed(2) 
                  : '0.00'}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">Overall Portfolio ROI</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">Win Rate Analysis</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Win rate indicates the percentage of profitable trades out of total trades.
            </p>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">
                {trades.length > 0 ? 
                  ((trades.filter(t => t.pnl > 0).length / trades.length) * 100).toFixed(2) 
                  : '0.00'}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">Overall Win Rate</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <h4 className="text-lg font-semibold text-foreground">Cost Efficiency</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Cost efficiency measures profitability relative to trading volume.
            </p>
            <div className="text-center">
              <span className="text-2xl font-bold text-warning">
                {trades.length > 0 ? 
                  (trades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / 
                    trades.reduce((sum, t) => sum + (t.amount), 0)).toFixed(2) 
                  : '0.00'}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Profit per Dollar Traded</p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};