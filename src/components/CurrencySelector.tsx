import { useCurrency } from "@/contexts/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, IndianRupee, RefreshCw } from "lucide-react";

export const CurrencySelector = () => {
  const { currency, setCurrency, lastUpdated } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <Select value={currency} onValueChange={(value: "USD" | "INR") => setCurrency(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>USD</span>
            </div>
          </SelectItem>
          <SelectItem value="INR">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              <span>INR</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {lastUpdated && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          <span title={`Last updated: ${lastUpdated.toLocaleString()}`}>
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
};