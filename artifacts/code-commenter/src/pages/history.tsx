import { useGetHistory, useDeleteHistoryItem, getGetHistoryQueryKey, useGetHistoryItem, getGetHistoryItemQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, History as HistoryIcon, TerminalSquare, AlertCircle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

function HistoryItemView({ id, open, onOpenChange }: { id: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: item, isLoading } = useGetHistoryItem(id as number, { 
    query: { 
      queryKey: getGetHistoryItemQueryKey(id as number),
      enabled: !!id 
    } 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <TerminalSquare className="w-5 h-5 text-primary" />
            Generation Details
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 flex justify-center"><Skeleton className="h-32 w-full" /></div>
        ) : item ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-[#0d1117]/50 rounded-md max-h-[500px] overflow-auto hide-scrollbar border border-border/30">
              <div className="text-[10px] uppercase font-mono text-muted-foreground mb-2 sticky top-0 bg-[#0d1117]/90 p-1 rounded backdrop-blur-sm z-10 w-fit">Input Code ({item.language})</div>
              <pre className="font-mono text-xs text-gray-400">
                <code>{item.inputCode}</code>
              </pre>
            </div>
            <div className="p-4 bg-[#0d1117] rounded-md max-h-[500px] overflow-auto hide-scrollbar border border-border/30">
              <div className="text-[10px] uppercase font-mono text-primary mb-2 sticky top-0 bg-[#0d1117]/90 p-1 rounded backdrop-blur-sm z-10 w-fit">Output ({item.mode})</div>
              <pre className="font-mono text-xs text-gray-200">
                <code>{item.output}</code>
              </pre>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function History() {
  const queryClient = useQueryClient();
  const { data: historyItems, isLoading, error } = useGetHistory({ 
    query: { queryKey: getGetHistoryQueryKey() } 
  });
  const deleteItem = useDeleteHistoryItem();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey() });
        setDeletingId(null);
      },
      onError: () => {
        setDeletingId(null);
      }
    });
  };

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'java': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cpp': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'bugs': return 'text-destructive border-destructive/30';
      case 'readme': return 'text-primary border-primary/30';
      case 'docstrings': return 'text-green-400 border-green-400/30';
      default: return 'text-muted-foreground border-border';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
        <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Failed to load history</h2>
        <p className="text-muted-foreground">There was an error fetching your generation history.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary" />
          History
        </h1>
        <p className="text-muted-foreground">Review and manage your past code generations.</p>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : historyItems && historyItems.length > 0 ? (
          <div className="grid gap-4">
            {historyItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group transition-all hover:border-primary/30"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between border-b border-border/30 bg-background/20 pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className={`font-mono text-xs ${getLanguageColor(item.language)}`}>
                        {item.language}
                      </Badge>
                      <Badge variant="outline" className={`font-mono text-xs uppercase ${getModeColor(item.mode)}`}>
                        {item.mode}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <TerminalSquare className="w-3 h-3" />
                        {format(new Date(item.createdAt), "MMM d, yyyy • HH:mm")}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setViewId(item.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={deletingId === item.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-border/50 bg-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete History Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this generation history? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-secondary/50 border-border/50">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/30">
                    <div className="p-4 bg-[#0d1117]/50 max-h-[250px] overflow-auto hide-scrollbar">
                      <div className="text-[10px] uppercase font-mono text-muted-foreground mb-2 sticky top-0 bg-[#0d1117]/90 p-1 rounded backdrop-blur-sm z-10 w-fit">Input</div>
                      <pre className="font-mono text-xs text-gray-400">
                        <code>{item.inputCode}</code>
                      </pre>
                    </div>
                    <div className="p-4 bg-[#0d1117] max-h-[250px] overflow-auto hide-scrollbar">
                      <div className="text-[10px] uppercase font-mono text-primary mb-2 sticky top-0 bg-[#0d1117]/90 p-1 rounded backdrop-blur-sm z-10 w-fit">Output</div>
                      <pre className="font-mono text-xs text-gray-200">
                        <code>{item.output}</code>
                      </pre>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm py-16">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No history yet</h3>
              <p className="text-sm">Your generated documentation will appear here.</p>
            </div>
          </Card>
        )}
      </div>

      <HistoryItemView 
        id={viewId} 
        open={viewId !== null} 
        onOpenChange={(open) => !open && setViewId(null)} 
      />
    </div>
  );
}
