import { Card } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg?: "primary" | "success" | "destructive";
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  iconBg = "primary"
}: StatCardProps) => {
  const { currency } = useCurrency();
  const iconBgColors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  };

  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-lg ${iconBgColors[iconBg]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {change && (
            <p className={`text-sm font-medium ${changeColors[changeType]}`}>
              {changeType === "positive" ? "+" : ""}{change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};