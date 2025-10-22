import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface DebugTradeFiltersProps {
  trades: any[];
  onFiltersChange: (filters: any) => void;
}

export const DebugTradeFilters = ({ trades, onFiltersChange }: DebugTradeFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  console.log("DebugTradeFilters rendering, isOpen:", isOpen);
  
  const toggleFilters = () => {
    console.log("Toggle filters called, isOpen was:", isOpen);
    setIsOpen(!isOpen);
    console.log("isOpen is now:", !isOpen);
  };
  
  return (
    <Card className="p-4 mb-6 bg-card/50 backdrop-blur-sm relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-lg font-semibold">Debug Trade Filters</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFilters}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {isOpen ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-4"
          style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            marginTop: '0.5rem', 
            zIndex: 50, 
            backgroundColor: 'hsl(var(--background))', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: '0.5rem', 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
            padding: '1rem',
            color: 'hsl(var(--foreground))'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold">Filter Options</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Debug Info</label>
              <div className="p-2 bg-muted rounded">
                <p>isOpen: {isOpen ? 'true' : 'false'}</p>
                <p>Trades count: {trades.length}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Test Controls</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => console.log("Test button clicked")}
                >
                  Test Button
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  Close Dropdown
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};