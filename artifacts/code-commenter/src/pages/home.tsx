import { useState } from "react";
import { useGenerateDocumentation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, FileCode2, Copy, Check, Sparkles, Loader2, Terminal } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";

type Language = "python" | "java" | "cpp";
type Mode = "comments" | "docstrings" | "readme" | "bugs";

const modes = [
  { value: "comments", label: "Inline Comments", description: "Adds line-by-line explanations to the code." },
  { value: "docstrings", label: "Docstrings", description: "Generates function and class-level docstrings." },
  { value: "readme", label: "README", description: "Creates a full README.md from the provided code." },
  { value: "bugs", label: "Bug Detection", description: "Finds potential bugs, edge cases, and issues." },
];

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("python");
  const [mode, setMode] = useState<Mode>("comments");
  const { isCopied, copyToClipboard } = useCopy();

  const generateDoc = useGenerateDocumentation();

  const handleGenerate = () => {
    if (!code.trim()) return;
    
    generateDoc.mutate({
      data: {
        code,
        language,
        mode
      }
    });
  };

  const selectedModeDetails = modes.find(m => m.value === mode);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Generator</h1>
        <p className="text-muted-foreground">Paste your code to generate documentation, comments, or detect bugs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        {/* Input Panel */}
        <Card className="flex flex-col border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Language</Label>
                    <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                      <SelectTrigger id="language" className="bg-background/50 border-border/50 focus:ring-primary/50">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mode" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Mode</Label>
                    <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                      <SelectTrigger id="mode" className="bg-background/50 border-border/50 focus:ring-primary/50">
                        <SelectValue placeholder="Select Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {modes.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedModeDetails && (
                  <p className="text-sm text-muted-foreground border-l-2 border-primary/50 pl-3 py-1">
                    {selectedModeDetails.description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pb-6">
            <div className="flex-1 relative flex flex-col group">
              <Textarea 
                placeholder="Paste your code here..."
                className="flex-1 resize-none font-mono text-sm leading-relaxed p-4 bg-background/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 rounded-md hide-scrollbar"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <FileCode2 className="w-5 h-5 text-muted-foreground/30" />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleGenerate} 
                disabled={!code.trim() || generateDoc.isPending}
                className="w-full sm:w-auto relative overflow-hidden group shadow-md shadow-primary/20"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {generateDoc.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Code...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="flex flex-col border-border/50 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50 bg-background/30 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono font-medium flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Output Console
            </CardTitle>
            {generateDoc.data && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => copyToClipboard(generateDoc.data?.output || "")}
              >
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-auto bg-[#0d1117]">
            {!generateDoc.data && !generateDoc.isPending && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4 border border-border/50">
                  <Play className="w-6 h-6 ml-1 text-primary/50" />
                </div>
                <p className="font-medium text-foreground">Awaiting Input</p>
                <p className="text-sm max-w-[250px] mt-2">Provide code and hit generate to see the results here.</p>
              </div>
            )}
            
            {generateDoc.isPending && (
              <div className="h-full flex flex-col items-center justify-center text-primary p-8">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm font-mono animate-pulse">Analyzing structure...</p>
              </div>
            )}

            {generateDoc.data && !generateDoc.isPending && (
              <div className="p-4 w-full h-full overflow-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                <pre className="font-mono text-sm text-gray-300 w-full">
                  <code className="block whitespace-pre-wrap break-words">{generateDoc.data.output}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
