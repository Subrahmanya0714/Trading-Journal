import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  type: "long" | "short";
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  amount: number;
  amountRisking: number;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  riskToReward: string;
  strategy: string;
  notes: string;
  screenshot?: string;
  status: "open" | "closed";
  amountRiskingCurrency?: "USD" | "INR";
}

interface TradeFiltersProps {
  trades: Trade[];
  onFiltersChange: (filters: FilterCriteria) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface FilterCriteria {
  dateRange: { from: Date | undefined; to: Date | undefined };
  tradeType: "all" | "long" | "short";
  symbol: string;
  strategy: string;
  minPnL: number;
  maxPnL: number;
  minAmountRisking: number;
  maxAmountRisking: number;
  profitStatus: "all" | "profit" | "loss" | "breakeven";
  riskRewardRatio: string;
  minQuantity: number;
  maxQuantity: number;
}

const getDefaultFilters = (): FilterCriteria => ({
  dateRange: { from: undefined, to: undefined },
  tradeType: "all",
  symbol: "",
  strategy: "",
  minPnL: -Infinity,
  maxPnL: Infinity,
  minAmountRisking: 0,
  maxAmountRisking: Infinity,
  profitStatus: "all",
  riskRewardRatio: "",
  minQuantity: 0,
  maxQuantity: Infinity,
});

export const TradeFilters = ({ trades, onFiltersChange, isOpen, setIsOpen }: TradeFiltersProps) => {
  const [filters, setFilters] = useState<FilterCriteria>(getDefaultFilters());
  
  // Extract unique strategies, symbols, and risk/reward ratios for filter options
  const strategies = Array.from(new Set(trades.map(trade => trade.strategy)));
  const symbols = Array.from(new Set(trades.map(trade => trade.symbol)));
  const riskRewardRatios = Array.from(new Set(trades.map(trade => trade.riskToReward)));
  
  // Calculate min/max values for sliders
  const minPnL = Math.min(...trades.map(t => t.pnl));
  const maxPnL = Math.max(...trades.map(t => t.pnl));
  const minAmountRisking = Math.min(...trades.map(t => t.amountRisking));
  const maxAmountRisking = Math.max(...trades.map(t => t.amountRisking));
  const minQuantity = Math.min(...trades.map(t => t.quantity));
  const maxQuantity = Math.max(...trades.map(t => t.quantity));
  
  // Update filters when trades change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);
  
  const handleDateSelect = (date: Date | undefined, type: "from" | "to") => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };
  
  const resetFilters = () => {
    setFilters(getDefaultFilters());
  };
  
  const hasActiveFilters = () => {
    return (
      filters.dateRange.from !== undefined ||
      filters.dateRange.to !== undefined ||
      filters.tradeType !== "all" ||
      filters.symbol !== "" ||
      filters.strategy !== "" ||
      filters.minPnL !== -Infinity ||
      filters.maxPnL !== Infinity ||
      filters.minAmountRisking !== 0 ||
      filters.maxAmountRisking !== Infinity ||
      filters.profitStatus !== "all" ||
      filters.riskRewardRatio !== "" ||
      filters.minQuantity !== 0 ||
      filters.maxQuantity !== Infinity
    );
  };
  
  return (
    <Card className="p-4 mb-6 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-lg font-semibold">Trade Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>
      
      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => handleDateSelect(date, "from")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => handleDateSelect(date, "to")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Trade Type Filter */}
          <div className="space-y-2">
            <Label>Trade Type</Label>
            <Select 
              value={filters.tradeType} 
              onValueChange={(value: "all" | "long" | "short") => 
                setFilters(prev => ({ ...prev, tradeType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Profit Status Filter */}
          <div className="space-y-2">
            <Label>Profit Status</Label>
            <Select 
              value={filters.profitStatus} 
              onValueChange={(value: "all" | "profit" | "loss" | "breakeven") => 
                setFilters(prev => ({ ...prev, profitStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                <SelectItem value="profit">Winning Trades</SelectItem>
                <SelectItem value="loss">Losing Trades</SelectItem>
                <SelectItem value="breakeven">Breakeven Trades</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Symbol Filter */}
          <div className="space-y-2">
            <Label>Symbol</Label>
            <Select 
              value={filters.symbol} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, symbol: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Symbols</SelectItem>
                {symbols.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Strategy Filter */}
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select 
              value={filters.strategy} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, strategy: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Strategies</SelectItem>
                {strategies.map(strategy => (
                  <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Risk/Reward Ratio Filter */}
          <div className="space-y-2">
            <Label>Risk/Reward Ratio</Label>
            <Select 
              value={filters.riskRewardRatio} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, riskRewardRatio: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Ratios</SelectItem>
                {riskRewardRatios.map(ratio => (
                  <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* P&L Range Filter */}
          <div className="space-y-2">
            <Label>P&L Range (${minPnL.toFixed(0)} to ${maxPnL.toFixed(0)})</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={filters.minPnL === -Infinity ? "" : filters.minPnL}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    minPnL: e.target.value === "" ? -Infinity : Number(e.target.value) 
                  }))
                }
                placeholder="Min"
                className="w-24"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                value={filters.maxPnL === Infinity ? "" : filters.maxPnL}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    maxPnL: e.target.value === "" ? Infinity : Number(e.target.value) 
                  }))
                }
                placeholder="Max"
                className="w-24"
              />
            </div>
          </div>
          
          {/* Amount Risking Range Filter */}
          <div className="space-y-2">
            <Label>Amount Risking Range (${minAmountRisking.toFixed(0)} to ${maxAmountRisking.toFixed(0)})</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={filters.minAmountRisking === 0 ? "" : filters.minAmountRisking}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    minAmountRisking: e.target.value === "" ? 0 : Number(e.target.value) 
                  }))
                }
                placeholder="Min"
                className="w-24"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                value={filters.maxAmountRisking === Infinity ? "" : filters.maxAmountRisking}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    maxAmountRisking: e.target.value === "" ? Infinity : Number(e.target.value) 
                  }))
                }
                placeholder="Max"
                className="w-24"
              />
            </div>
          </div>
          
          {/* Quantity Range Filter */}
          <div className="space-y-2">
            <Label>Quantity Range ({minQuantity.toFixed(0)} to {maxQuantity.toFixed(0)})</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={filters.minQuantity === 0 ? "" : filters.minQuantity}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    minQuantity: e.target.value === "" ? 0 : Number(e.target.value) 
                  }))
                }
                placeholder="Min"
                className="w-24"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                value={filters.maxQuantity === Infinity ? "" : filters.maxQuantity}
                onChange={(e) => 
                  setFilters(prev => ({ 
                    ...prev, 
                    maxQuantity: e.target.value === "" ? Infinity : Number(e.target.value) 
                  }))
                }
                placeholder="Max"
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}
      
      {hasActiveFilters() && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.dateRange.from && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              From: {format(filters.dateRange.from, "MMM d, yyyy")}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => handleDateSelect(undefined, "from")}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dateRange.to && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              To: {format(filters.dateRange.to, "MMM d, yyyy")}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => handleDateSelect(undefined, "to")}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.tradeType !== "all" && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Type: {filters.tradeType}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, tradeType: "all" }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.profitStatus !== "all" && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Status: {filters.profitStatus === "profit" ? "Winning" : filters.profitStatus === "loss" ? "Losing" : "Breakeven"}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, profitStatus: "all" }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.symbol && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Symbol: {filters.symbol}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, symbol: "" }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.strategy && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Strategy: {filters.strategy}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, strategy: "" }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.riskRewardRatio && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              R/R: {filters.riskRewardRatio}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, riskRewardRatio: "" }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.minPnL !== -Infinity || filters.maxPnL !== Infinity) && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              P&L: {filters.minPnL === -Infinity ? "Any" : `$${filters.minPnL}`} - {filters.maxPnL === Infinity ? "Any" : `$${filters.maxPnL}`}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, minPnL: -Infinity, maxPnL: Infinity }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.minAmountRisking !== 0 || filters.maxAmountRisking !== Infinity) && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Risking: {filters.minAmountRisking === 0 ? "Any" : `$${filters.minAmountRisking}`} - {filters.maxAmountRisking === Infinity ? "Any" : `$${filters.maxAmountRisking}`}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, minAmountRisking: 0, maxAmountRisking: Infinity }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.minQuantity !== 0 || filters.maxQuantity !== Infinity) && (
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              Quantity: {filters.minQuantity === 0 ? "Any" : `${filters.minQuantity}`} - {filters.maxQuantity === Infinity ? "Any" : `${filters.maxQuantity}`}
              <button 
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                onClick={() => setFilters(prev => ({ ...prev, minQuantity: 0, maxQuantity: Infinity }))}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </Card>
  );
};