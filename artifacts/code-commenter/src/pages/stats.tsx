import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Activity, Code2, FileText, Bug, List, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Stats() {
  const { data: stats, isLoading } = useGetStats({ 
    query: { queryKey: getGetStatsQueryKey() } 
  });

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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full gap-6 w-full max-w-6xl mx-auto">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>No stats available</div>;
  }

  return (
    <div className="flex flex-col h-full gap-6 w-full max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Usage Statistics
        </h1>
        <p className="text-muted-foreground">Insights and metrics from your generation history.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono">Total Generations</CardTitle>
            <Hash className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{stats.totalGenerations}</div>
            <p className="text-xs text-muted-foreground mt-1">Snippets processed</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono">Most Used Language</CardTitle>
            <Code2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground capitalize">
              {Object.entries(stats.byLanguage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on history</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono">Most Used Mode</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground capitalize">
              {Object.entries(stats.byMode).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on history</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown Panel */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              Breakdowns
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">By Language</h4>
              {Object.entries(stats.byLanguage).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between">
                  <span className="capitalize text-sm font-medium">{lang}</span>
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">By Mode</h4>
              {Object.entries(stats.byMode).map(([mode, count]) => (
                <div key={mode} className="flex items-center justify-between">
                  <span className="capitalize text-sm font-medium">{mode}</span>
                  <span className="font-mono text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your 5 most recent generations</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/30 bg-background/30 hover:border-primary/30 transition-colors" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`font-mono text-[10px] px-1.5 py-0 ${getLanguageColor(item.language)}`}>
                          {item.language}
                        </Badge>
                        <Badge variant="outline" className={`font-mono text-[10px] uppercase px-1.5 py-0 ${getModeColor(item.mode)}`}>
                          {item.mode}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-mono mt-1">
                        {item.inputCode.split('\n')[0]}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {format(new Date(item.createdAt), "MMM d")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm pb-8">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
