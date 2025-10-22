import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

// Define the form data interface
interface FormData {
  symbol: string;
  type: "long" | "short";
  entry: string;
  exit: string;
  amountRisking: string;
  amountRiskingCurrency: "USD" | "INR";
  date: string;
  startTime: string;
  endTime: string;
  riskToReward: string;
  strategy: string;
  notes: string;
  isProfit: boolean; // Add this new field
}

interface AddTradeDialogProps {
  onAddTrade: (trade: any) => void;
}

export const AddTradeDialog = ({ onAddTrade }: AddTradeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    symbol: "",
    type: "long",
    entry: "",
    exit: "",
    amountRisking: "",
    amountRiskingCurrency: "USD",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    riskToReward: "",
    strategy: "",
    notes: "",
    isProfit: true, // Add this new field with default value
  });
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = parseFloat(formData.entry);
    const exit = parseFloat(formData.exit);
    const amountRisking = parseFloat(formData.amountRisking);
    
    // Calculate quantity based on amount risking and entry price
    // For long positions: quantity = amountRisking / entry
    // For short positions: quantity = amountRisking / entry (simplified calculation)
    const quantity = amountRisking / entry;
    
    // Calculate P&L based on the profit/loss checkbox and Risk to Reward ratio
    let pnl = 0;
    let amount = 0;
    
    // Parse the risk to reward ratio (e.g., "1:3" means risk 1 unit to gain 3 units)
    const riskToRewardParts = formData.riskToReward.split(':');
    if (riskToRewardParts.length === 2) {
      const risk = parseFloat(riskToRewardParts[0]);
      const reward = parseFloat(riskToRewardParts[1]);
      
      // Calculate P&L based on profit/loss checkbox:
      // If profit is checked: P&L = amount risking * reward
      // If loss is checked: P&L = -amount risking * risk
      if (formData.isProfit) {
        // Profit: P&L = amount risking * reward
        pnl = amountRisking * reward;
      } else {
        // Loss: P&L = -amount risking * risk
        pnl = -amountRisking * risk;
      }
      
      amount = Math.abs(pnl);
    } else {
      // Fallback to original calculation if risk/reward format is invalid
      pnl = (exit - entry) * quantity;
      amount = Math.abs(pnl);
    }
    
    // Calculate day of week from date
    const tradeDate = new Date(formData.date);
    const dayOfWeek = tradeDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const newTrade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: formData.symbol,
      type: formData.type,
      entry,
      exit,
      quantity,
      pnl,
      amount,
      // Store the original amount risking value to avoid calculation discrepancies
      amountRisking: amountRisking,
      date: formData.date,
      day: dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      riskToReward: formData.riskToReward,
      strategy: formData.strategy,
      notes: formData.notes,
      screenshot: screenshot || undefined,
      status: "closed" as const,
      // Store the currency information for this trade
      amountRiskingCurrency: formData.amountRiskingCurrency,
    };

    onAddTrade(newTrade);
    toast.success("Trade added successfully!");
    setOpen(false);
    setScreenshot(null);
    setFormData({
      symbol: "",
      type: "long",
      entry: "",
      exit: "",
      amountRisking: "",
      amountRiskingCurrency: "USD",
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      riskToReward: "",
      strategy: "",
      notes: "",
      isProfit: true, // Add this field to the reset
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant">
          <Plus className="w-4 h-4 mr-2" />
          Add Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol / Pair</Label>
            <Input
              id="symbol"
              placeholder="e.g., AAPL, TSLA, EUR/USD"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: "long" | "short") => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entry Price</Label>
              <Input
                id="entry"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.entry}
                onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit">Exit Price</Label>
              <Input
                id="exit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.exit}
                onChange={(e) => setFormData({ ...formData, exit: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amountRisking">Amount Risking</Label>
              <div className="flex gap-2">
                <Input
                  id="amountRisking"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amountRisking}
                  onChange={(e) => setFormData({ ...formData, amountRisking: e.target.value })}
                  className="flex-1"
                  required
                />
                <Select 
                  value={formData.amountRiskingCurrency} 
                  onValueChange={(value: "USD" | "INR") => setFormData({ ...formData, amountRiskingCurrency: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskToReward">Risk to Reward Ratio</Label>
            <Input
              id="riskToReward"
              type="text"
              placeholder="e.g., 1:2, 1:3"
              value={formData.riskToReward}
              onChange={(e) => setFormData({ ...formData, riskToReward: e.target.value })}
              required
            />
          </div>

          {/* Profit/Loss Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isProfit"
                checked={formData.isProfit}
                onCheckedChange={(checked) => setFormData({ ...formData, isProfit: !!checked })}
              />
              <Label htmlFor="isProfit" className="flex items-center gap-2">
                {formData.isProfit ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span>Profit Trade</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span>Loss Trade</span>
                  </>
                )}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.isProfit 
                ? "This trade resulted in a profit" 
                : "This trade resulted in a loss"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy">Trading Strategy</Label>
            <Input
              id="strategy"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              placeholder="e.g., Breakout, Mean Reversion, Momentum..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add any notes about this trade..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Trade Screenshot</Label>
            <div className="space-y-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {screenshot && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={screenshot} 
                    alt="Trade screenshot preview" 
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setScreenshot(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a screenshot of your trade chart (max 5MB)
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity">
              Add Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};