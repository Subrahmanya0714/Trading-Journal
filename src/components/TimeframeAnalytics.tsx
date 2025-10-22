import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { StrategyManager } from "@/components/StrategyManager";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
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

interface TimeframeAnalyticsProps {
  trades: Trade[];
}

export const TimeframeAnalytics = ({ trades, onUpdateStrategy, onDeleteStrategy, onAddStrategy }: TimeframeAnalyticsProps & { 
  onUpdateStrategy?: (oldName: string, newName: string) => void;
  onDeleteStrategy?: (name: string) => void;
  onAddStrategy?: (name: string) => void;
}) => {
  const { formatAmount } = useCurrency();
  
  // Helper function to group trades by timeframe
  const groupByTimeframe = (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const grouped: { [key: string]: Trade[] } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.date);
      let key = '';
      
      switch (timeframe) {
        case 'daily':
          key = trade.date;
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          key = String(date.getFullYear());
          break;
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(trade);
    });
    
    return grouped;
  };

  // Generate chart data for timeframe
  const getTimeframeData = (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const grouped = groupByTimeframe(timeframe);
    
    return Object.entries(grouped).map(([date, trades]) => {
      const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
      const wins = trades.filter(t => t.pnl > 0).length;
      const losses = trades.filter(t => t.pnl < 0).length;
      const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
      
      return {
        date: formatDate(date, timeframe),
        pnl: Number(totalPnL.toFixed(2)),
        trades: trades.length,
        wins,
        losses,
        winRate: Number(winRate.toFixed(1))
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Format date based on timeframe
  const formatDate = (dateStr: string, timeframe: string) => {
    const date = new Date(dateStr);
    
    switch (timeframe) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'yearly':
        return dateStr;
      default:
        return dateStr;
    }
  };

  // Get strategy performance data
  const getStrategyData = () => {
    const strategyMap: { [key: string]: { pnl: number; trades: number; wins: number } } = {};
    
    trades.forEach(trade => {
      if (!strategyMap[trade.strategy]) {
        strategyMap[trade.strategy] = { pnl: 0, trades: 0, wins: 0 };
      }
      strategyMap[trade.strategy].pnl += trade.pnl;
      strategyMap[trade.strategy].trades += 1;
      if (trade.pnl > 0) strategyMap[trade.strategy].wins += 1;
    });
    
    return Object.entries(strategyMap).map(([strategy, data]) => ({
      name: strategy,
      pnl: Number(data.pnl.toFixed(2)),
      trades: data.trades,
      winRate: Number(((data.wins / data.trades) * 100).toFixed(1)),
      color: ''
    }));
  };

  const strategyData = getStrategyData();
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];
  
  // Assign colors to strategies
  strategyData.forEach((strategy, index) => {
    strategy.color = COLORS[index % COLORS.length];
  });

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
                {entry.dataKey === 'pnl' || entry.dataKey === 'amount' ? formatAmount(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render timeframe tab content
  const renderTimeframeContent = (timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const data = getTimeframeData(timeframe);
    const totalPnL = data.reduce((sum, d) => sum + d.pnl, 0);
    const totalTrades = data.reduce((sum, d) => sum + d.trades, 0);
    const totalWins = data.reduce((sum, d) => sum + d.wins, 0);
    const overallWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalPnL >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <DollarSign className={`w-5 h-5 ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total P&L</p>
                <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-lg font-bold text-foreground">{overallWinRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Winning Trades</p>
                <p className="text-lg font-bold text-foreground">{totalWins}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Losing Trades</p>
                <p className="text-lg font-bold text-foreground">{totalTrades - totalWins}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* P&L Chart */}
        <Card className="bg-gradient-card shadow-card border-border/50 p-6">
          <h4 className="text-lg font-bold text-foreground mb-4">P&L Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="bg-gradient-card shadow-card border-border/50 p-6">
          <h4 className="text-lg font-bold text-foreground mb-4">Win/Loss Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="wins" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Wins"
              />
              <Line 
                type="monotone" 
                dataKey="losses" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Losses"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Multi-Timeframe Analytics</h3>
        <p className="text-sm text-muted-foreground">
          Comprehensive performance analysis across different time horizons
        </p>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          {renderTimeframeContent('daily')}
        </TabsContent>

        <TabsContent value="weekly">
          {renderTimeframeContent('weekly')}
        </TabsContent>

        <TabsContent value="monthly">
          {renderTimeframeContent('monthly')}
        </TabsContent>

        <TabsContent value="yearly">
          {renderTimeframeContent('yearly')}
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedAnalytics trades={trades} />
        </TabsContent>
      </Tabs>

      {/* Strategy Performance Section */}
      <div className="mt-8 pt-8 border-t border-border">
        <h4 className="text-xl font-bold text-foreground mb-6">Strategy Performance Analysis</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strategy P&L Chart */}
          <Card className="bg-card/50 border-border/50 p-6">
            <h5 className="text-lg font-semibold text-foreground mb-4">P&L by Strategy</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="pnl" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Strategy Win Rate Pie */}
          <Card className="bg-card/50 border-border/50 p-6">
            <h5 className="text-lg font-semibold text-foreground mb-4">Trade Distribution by Strategy</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={strategyData}
                  dataKey="trades"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name}: ${entry.trades}`}
                  labelLine={false}
                >
                  {strategyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Strategy Details Table */}
        <Card className="bg-card/50 border-border/50 p-6 mt-6">
          <h5 className="text-lg font-semibold text-foreground mb-4">Detailed Strategy Breakdown</h5>
          {onUpdateStrategy && onDeleteStrategy && onAddStrategy ? (
            <StrategyManager 
              strategies={strategyData} 
              onUpdateStrategy={onUpdateStrategy}
              onDeleteStrategy={onDeleteStrategy}
              onAddStrategy={onAddStrategy}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Strategy</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total Trades</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Win Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyData.map((strategy, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-foreground">{strategy.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-foreground">{strategy.trades}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`text-sm font-semibold ${strategy.winRate >= 50 ? 'text-success' : 'text-destructive'}`}>
                          {strategy.winRate}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={`text-sm font-bold ${strategy.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${strategy.pnl.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Card>
  );
};
