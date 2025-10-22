import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Strategy {
  name: string;
  trades: number;
  winRate: number;
  pnl: number;
  color: string;
}

interface StrategyManagerProps {
  strategies: Strategy[];
  onUpdateStrategy: (oldName: string, newName: string) => void;
  onDeleteStrategy: (name: string) => void;
  onAddStrategy: (name: string) => void;
}

export const StrategyManager = ({ strategies, onUpdateStrategy, onDeleteStrategy, onAddStrategy }: StrategyManagerProps) => {
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState("");

  const handleEditStart = (strategyName: string) => {
    setEditingStrategy(strategyName);
    setEditValue(strategyName);
  };

  const handleEditSave = () => {
    if (editValue.trim() && editingStrategy && editValue !== editingStrategy) {
      // Check if the new name already exists
      if (strategies.some(s => s.name === editValue)) {
        toast.error("A strategy with this name already exists");
        return;
      }
      
      onUpdateStrategy(editingStrategy, editValue);
      toast.success("Strategy updated successfully");
    }
    setEditingStrategy(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingStrategy(null);
    setEditValue("");
  };

  const handleDeleteRequest = (strategyName: string) => {
    setDeleteConfirmation(strategyName);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation) {
      onDeleteStrategy(deleteConfirmation);
      toast.success("Strategy deleted successfully");
      setDeleteConfirmation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  const handleAddStrategySubmit = () => {
    if (newStrategyName.trim()) {
      // Check if the strategy already exists
      if (strategies.some(s => s.name === newStrategyName)) {
        toast.error("A strategy with this name already exists");
        return;
      }
      
      onAddStrategy(newStrategyName);
      toast.success("Strategy added successfully");
      setNewStrategyName("");
      setIsAddDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Strategy Management</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4 mr-2" />
              Add Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Strategy</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input
                  id="name"
                  value={newStrategyName}
                  onChange={(e) => setNewStrategyName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter strategy name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddStrategySubmit();
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStrategySubmit}>Add Strategy</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Strategy</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total Trades</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Win Rate</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Total P&L</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((strategy, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: strategy.color }}
                    />
                    {editingStrategy === strategy.name ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave();
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditSave}
                          className="h-8 w-8 p-0"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-foreground">{strategy.name}</span>
                    )}
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
                <td className="text-right py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(strategy.name)}
                      className="h-8 w-8 p-0"
                      disabled={editingStrategy !== null}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRequest(strategy.name)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={editingStrategy !== null}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteConfirmation} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this strategy?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the strategy "{deleteConfirmation}" 
              and update all trades using this strategy. Please confirm you want to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Strategy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};