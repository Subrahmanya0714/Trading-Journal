import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp, TrendingDown, ImageIcon, Pencil } from "lucide-react";
import { EditTradeDialog } from "@/components/EditTradeDialog";

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

interface TradeCardProps {
  trade: Trade;
  onTradeUpdate?: (updatedTrade: Trade) => void;
}

export const TradeCard = ({ trade, onTradeUpdate }: TradeCardProps) => {
  const { currency, formatAmount } = useCurrency();
  const [imageOpen, setImageOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const isProfit = trade.pnl >= 0;
  const pnlPercentage = ((trade.exit - trade.entry) / trade.entry) * 100;

  // Format the amount risking - it's already converted in the Index page
  const formatAmountRisking = () => {
    // The amount risking value is already converted in the Index page
    // so we just need to format it according to the current currency
    return formatAmount(trade.amountRisking);
  };

  const handleTradeUpdate = (updatedTrade: any) => {
    if (onTradeUpdate) {
      onTradeUpdate(updatedTrade);
    }
    setEditDialogOpen(false);
  };

  return (
    <>
      <Card 
        className="bg-gradient-card shadow-card border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-[1.01] touch-manipulation"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-foreground">{trade.symbol}</h4>
                <Badge 
                  variant={trade.type === "long" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {trade.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{trade.day}, {trade.date}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {isProfit ? (
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 touch-manipulation"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Entry</p>
              <p className="text-sm font-semibold text-foreground">{formatAmount(trade.entry)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Exit</p>
              <p className="text-sm font-semibold text-foreground">{formatAmount(trade.exit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Time</p>
              <p className="text-sm font-semibold text-foreground">{trade.startTime}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Time</p>
              <p className="text-sm font-semibold text-foreground">{trade.endTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk to Reward</p>
              <p className="text-sm font-semibold text-foreground">{trade.riskToReward}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Strategy</p>
              <p className="text-sm font-semibold text-foreground">{trade.strategy}</p>
            </div>
          </div>

          {trade.notes && (
            <div className="mb-3 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground line-clamp-2">{trade.notes}</p>
            </div>
          )}

          {trade.screenshot && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Chart Screenshot</p>
              <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                <DialogTrigger asChild>
                  <div className="relative rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity group touch-manipulation">
                    <img 
                      src={trade.screenshot} 
                      alt="Trade chart screenshot" 
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0">
                  <img 
                    src={trade.screenshot} 
                    alt="Trade chart screenshot" 
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-border/50 gap-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount Risking</p>
              <p className="text-sm font-semibold text-foreground">{formatAmountRisking()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">P&L</p>
              <p className={`text-lg font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
                {isProfit ? "+" : ""}{formatAmount(Math.abs(trade.pnl))}
                <span className="text-xs ml-1">({pnlPercentage > 0 ? "+" : ""}{pnlPercentage.toFixed(2)}%)</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <EditTradeDialog
        trade={trade}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateTrade={handleTradeUpdate}
      />
    </>
  );
};