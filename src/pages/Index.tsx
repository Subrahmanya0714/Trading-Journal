import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { TradeCard } from "@/components/TradeCard";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { PerformanceChart } from "@/components/PerformanceChart";
import { TimeframeAnalytics } from "@/components/TimeframeAnalytics";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, DollarSign, Target, Award, LogOut } from "lucide-react";
import { toast } from "sonner";

const initialTrades = [
  {
    id: "1",
    symbol: "AAPL",
    type: "long" as const,
    entry: 150.25,
    exit: 155.80,
    quantity: 100,
    pnl: 300.00, // For 1:3 risk/reward with $100 risk = $300 reward
    amount: 300.00,
    amountRisking: 100.00,
    amountRiskingCurrency: "USD" as const,
    date: "2025-10-15",
    day: "Wednesday",
    startTime: "09:30",
    endTime: "14:45",
    riskToReward: "1:3",
    strategy: "Breakout",
    notes: "Strong breakout above resistance with high volume",
    status: "closed" as const,
  },
  {
    id: "2",
    symbol: "TSLA",
    type: "short" as const,
    entry: 245.60,
    exit: 238.20,
    quantity: 50,
    pnl: 150.00, // For 1:2 risk/reward with $150 risk = $300 reward, but actual was $150
    amount: 150.00,
    amountRisking: 150.00,
    amountRiskingCurrency: "USD" as const,
    date: "2025-10-14",
    day: "Tuesday",
    startTime: "10:15",
    endTime: "15:20",
    riskToReward: "1:2",
    strategy: "Reversal",
    notes: "Bearish reversal pattern on daily chart",
    status: "closed" as const,
  },
  {
    id: "3",
    symbol: "NVDA",
    type: "long" as const,
    entry: 420.00,
    exit: 415.50,
    quantity: 25,
    pnl: -75.00, // Losing trade, lost the amount risking ($75) for 1:2 risk/reward
    amount: 75.00,
    amountRisking: 75.00,
    amountRiskingCurrency: "USD" as const,
    date: "2025-10-13",
    day: "Monday",
    startTime: "11:00",
    endTime: "13:30",
    riskToReward: "1:2",
    strategy: "Momentum",
    notes: "Failed to break resistance, stopped out",
    status: "closed" as const,
  },
];

const chartData = [
  { date: "Oct 10", value: 0 },
  { date: "Oct 11", value: 250 },
  { date: "Oct 12", value: 180 },
  { date: "Oct 13", value: 67.5 },
  { date: "Oct 14", value: 437.5 },
  { date: "Oct 15", value: 992.5 },
];

const Index = () => {
  const { currency, convertAmount, formatAmount } = useCurrency();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState(initialTrades);
  const [editingTrade, setEditingTrade] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    tradeType: "all" as "all" | "long" | "short",
    symbol: "",
    strategy: "",
    minPnL: -Infinity,
    maxPnL: Infinity,
    minAmountRisking: 0,
    maxAmountRisking: Infinity,
    profitStatus: "all" as "all" | "profit" | "loss" | "breakeven",
    riskRewardRatio: "",
    minQuantity: 0,
    maxQuantity: Infinity,
  });

  // Apply filters to trades
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // Date range filter - simplified
      if (filters.dateRange.from) {
        const tradeDate = new Date(trade.date);
        const filterFromDate = new Date(filters.dateRange.from);
        // Compare just the date part
        if (tradeDate < filterFromDate) return false;
      }
      if (filters.dateRange.to) {
        const tradeDate = new Date(trade.date);
        const filterToDate = new Date(filters.dateRange.to);
        // Add one day to include the entire "to" date
        filterToDate.setDate(filterToDate.getDate() + 1);
        if (tradeDate >= filterToDate) return false;
      }
      
      // Trade type filter
      if (filters.tradeType !== "all" && trade.type !== filters.tradeType) return false;
      
      // Profit status filter
      if (filters.profitStatus === "profit" && trade.pnl <= 0) return false;
      if (filters.profitStatus === "loss" && trade.pnl >= 0) return false;
      if (filters.profitStatus === "breakeven" && trade.pnl !== 0) return false;
      
      // Symbol filter
      if (filters.symbol && trade.symbol !== filters.symbol) return false;
      
      // Strategy filter
      if (filters.strategy && trade.strategy !== filters.strategy) return false;
      
      // Risk/Reward ratio filter
      if (filters.riskRewardRatio && trade.riskToReward !== filters.riskRewardRatio) return false;
      
      // P&L range filter
      if (filters.minPnL !== -Infinity && trade.pnl < filters.minPnL) return false;
      if (filters.maxPnL !== Infinity && trade.pnl > filters.maxPnL) return false;
      
      // Amount risking range filter
      if (filters.minAmountRisking !== 0 && trade.amountRisking < filters.minAmountRisking) return false;
      if (filters.maxAmountRisking !== Infinity && trade.amountRisking > filters.maxAmountRisking) return false;
      
      // Quantity range filter
      if (filters.minQuantity !== 0 && trade.quantity < filters.minQuantity) return false;
      if (filters.maxQuantity !== Infinity && trade.quantity > filters.maxQuantity) return false;
      
      return true;
    });
  }, [trades, filters]);

  // Convert all trade values to the selected currency
  const convertedTrades = filteredTrades.map(trade => ({
    ...trade,
    entry: convertAmount(trade.entry, "USD", currency),
    exit: convertAmount(trade.exit, "USD", currency),
    pnl: convertAmount(trade.pnl, "USD", currency),
    amount: convertAmount(trade.amount, "USD", currency),
    // Also convert amount risking - ensure it uses the correct original currency
    amountRisking: trade.amountRiskingCurrency 
      ? convertAmount(trade.amountRisking, trade.amountRiskingCurrency, currency)
      : convertAmount(trade.amountRisking, "USD", currency),
  }));

  // Recalculate stats based on filtered trades
  const totalPnL = convertedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = convertedTrades.filter(t => t.pnl > 0).length;
  const totalFilteredTrades = convertedTrades.length;
  const winRate = totalFilteredTrades > 0 ? (winningTrades / totalFilteredTrades) * 100 : 0;
  const avgWin = convertedTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / (winningTrades || 1);

  const handleAddTrade = (newTrade: any) => {
    setTrades([newTrade, ...trades]);
  };

  const handleUpdateTrade = (updatedTrade: any) => {
    const updatedTrades = trades.map(trade => 
      trade.id === updatedTrade.id ? updatedTrade : trade
    );
    setTrades(updatedTrades);
    setEditDialogOpen(false);
    setEditingTrade(null);
    toast.success("Trade updated successfully!");
  };

  const handleEditTrade = (trade: any) => {
    setEditingTrade(trade);
    setEditDialogOpen(true);
  };

  const handleUpdateStrategy = (oldName: string, newName: string) => {
    // Update strategy name in all trades
    const updatedTrades = trades.map(trade => 
      trade.strategy === oldName ? { ...trade, strategy: newName } : trade
    );
    setTrades(updatedTrades);
  };

  const handleDeleteStrategy = (strategyName: string) => {
    // For now, we'll just rename deleted strategies to "Other"
    // In a real app, you might want to prompt the user for a new strategy name
    const updatedTrades = trades.map(trade => 
      trade.strategy === strategyName ? { ...trade, strategy: "Other" } : trade
    );
    setTrades(updatedTrades);
  };

  const handleAddStrategy = (strategyName: string) => {
    // In a real application, you might want to store strategies separately
    // For now, we'll just show a success message
    toast.success(`Strategy "${strategyName}" added successfully`);
    // The strategy will be available when creating new trades
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">TradeJournal Pro</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Professional Trading Analytics</p>
              {user && (
                <p className="text-xs text-muted-foreground mt-1">
                  Welcome, {user.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <CurrencySelector />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="relative h-8 w-8 sm:h-10 sm:w-10">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <AddTradeDialog onAddTrade={handleAddTrade} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total P&L"
            value={formatAmount(totalPnL)}
            change={`${totalPnL >= 0 ? '+' : ''}${formatAmount(Math.abs(totalPnL))}`}
            changeType={totalPnL >= 0 ? "positive" : "negative"}
            icon={DollarSign}
            iconBg={totalPnL >= 0 ? "success" : "destructive"}
          />
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            change={`${winningTrades}/${totalFilteredTrades} wins`}
            changeType="neutral"
            icon={Target}
            iconBg="primary"
          />
          <StatCard
            title="Total Trades"
            value={totalFilteredTrades.toString()}
            icon={TrendingUp}
            iconBg="primary"
          />
          <StatCard
            title="Avg Win"
            value={formatAmount(avgWin)}
            icon={Award}
            iconBg="success"
          />
        </div>

        {/* Performance Chart */}
        <div className="mb-6 sm:mb-8">
          <PerformanceChart data={chartData} />
        </div>

        {/* Multi-Timeframe Analytics */}
        <div className="mb-6 sm:mb-8">
          <TimeframeAnalytics 
            trades={convertedTrades} 
            onUpdateStrategy={handleUpdateStrategy}
            onDeleteStrategy={handleDeleteStrategy}
            onAddStrategy={handleAddStrategy}
          />
        </div>

        {/* Recent Trades */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Trades</h2>
            <p className="text-sm text-muted-foreground">
              {convertedTrades.length} of {trades.length} trades
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {convertedTrades.map((trade) => (
              <TradeCard 
                key={trade.id} 
                trade={trade} 
                onTradeUpdate={handleUpdateTrade} 
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;