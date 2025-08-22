import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, FileCode, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversionResult {
  convertedCode: string;
  warnings: string[];
  unsupportedConstructs: string[];
}

export const CodeConverter = () => {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [isConverting, setIsConverting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [unsupportedConstructs, setUnsupportedConstructs] = useState<string[]>([]);
  const { toast } = useToast();

  const convertCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "No code to convert",
        description: "Please enter some code to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    try {
      const result = await performConversion(inputCode, sourceLanguage, targetLanguage);
      setOutputCode(result.convertedCode);
      setWarnings(result.warnings);
      setUnsupportedConstructs(result.unsupportedConstructs);
      
      toast({
        title: "Conversion completed",
        description: `Code successfully converted to ${targetLanguage}`,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "An error occurred during conversion.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(outputCode);
    toast({
      title: "Copied to clipboard",
      description: "The converted code has been copied to your clipboard.",
    });
  };

  const downloadCode = () => {
    const extension = targetLanguage === "pyspark" ? "py" : "py";
    const blob = new Blob([outputCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/20 to-success/20 rounded-full border border-primary/30">
          <FileCode className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Enterprise Code Migration Tool</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
          Legacy Script Converter
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your Perl and Shell scripts into modern Python or PySpark code with intelligent conversion and enterprise-grade reliability.
        </p>
      </div>

      {/* Configuration */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source-lang">Source Language</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="source-lang">
                <SelectValue placeholder="Select source language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="bash">Bash/Shell</SelectItem>
                <SelectItem value="perl">Perl</SelectItem>
                <SelectItem value="mixed">Mixed Scripts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-lang">Target Language</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="target-lang">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="pyspark">PySpark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={convertCode} 
              disabled={isConverting}
              className="w-full bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90"
            >
              {isConverting ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Convert Code
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Code Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Legacy Code Input</h3>
              <Badge variant="outline" className="text-muted-foreground">
                {sourceLanguage === "auto" ? "Auto-detect" : sourceLanguage.toUpperCase()}
              </Badge>
            </div>
            <Textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your Perl or Shell script here..."
              className="min-h-[400px] font-mono text-sm bg-code-bg border-code-border"
            />
          </div>
        </Card>

        {/* Output */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Converted Code</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary">
                  {targetLanguage === "pyspark" ? "PySpark" : "Python"}
                </Badge>
                {outputCode && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadCode}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Textarea
              value={outputCode}
              readOnly
              placeholder="Converted code will appear here..."
              className="min-h-[400px] font-mono text-sm bg-code-bg border-code-border"
            />
          </div>
        </Card>
      </div>

      {/* Warnings and Unsupported Constructs */}
      {(warnings.length > 0 || unsupportedConstructs.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warnings.length > 0 && (
            <Card className="p-6 bg-warning/5 border-warning/20">
              <h3 className="text-lg font-semibold text-warning mb-4">Conversion Warnings</h3>
              <ul className="space-y-2">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-warning/80 flex items-start gap-2">
                    <span className="w-1 h-1 bg-warning rounded-full mt-2 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          
          {unsupportedConstructs.length > 0 && (
            <Card className="p-6 bg-destructive/5 border-destructive/20">
              <h3 className="text-lg font-semibold text-destructive mb-4">Unsupported Constructs</h3>
              <ul className="space-y-2">
                {unsupportedConstructs.map((construct, index) => (
                  <li key={index} className="text-sm text-destructive/80 flex items-start gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full mt-2 flex-shrink-0" />
                    {construct}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Mock conversion function - in a real app, this would call your conversion service
async function performConversion(
  code: string, 
  sourceLanguage: string, 
  targetLanguage: string
): Promise<ConversionResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple conversion logic for demonstration
  let convertedCode = "";
  const warnings: string[] = [];
  const unsupportedConstructs: string[] = [];
  
  const lines = code.split('\n');
  const convertedLines: string[] = [];
  
  // Add imports based on target language
  if (targetLanguage === "pyspark") {
    convertedLines.push("from pyspark.sql import SparkSession");
    convertedLines.push("import pyspark.sql.functions as F");
    convertedLines.push("");
    convertedLines.push("# Initialize SparkSession");
    convertedLines.push("spark = SparkSession.builder.appName('ConvertedScript').getOrCreate()");
    convertedLines.push("");
  } else {
    convertedLines.push("import os");
    convertedLines.push("import re");
    convertedLines.push("import sys");
    convertedLines.push("");
  }
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      convertedLines.push(line);
      continue;
    }
    
    // Variable assignment
    if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
      const [varName, value] = trimmedLine.split('=', 2);
      convertedLines.push(`${varName.trim()} = ${value.trim()}`);
      continue;
    }
    
    // Echo/print statements
    if (trimmedLine.startsWith('echo ')) {
      const content = trimmedLine.substring(5).replace(/"/g, '"');
      convertedLines.push(`print(${content})`);
      continue;
    }
    
    // Perl print statements
    if (trimmedLine.startsWith('print ')) {
      convertedLines.push(trimmedLine.replace('print ', 'print(') + ')');
      continue;
    }
    
    // If statements
    if (trimmedLine.startsWith('if ')) {
      const condition = trimmedLine.substring(3).replace(/\[ /, '').replace(/ \]/, '');
      convertedLines.push(`if ${condition.replace('-eq', '==').replace('-ne', '!=').replace('-lt', '<').replace('-gt', '>')}:`);
      continue;
    }
    
    // For loops
    if (trimmedLine.startsWith('for ')) {
      if (trimmedLine.includes(' in ')) {
        const parts = trimmedLine.split(' in ');
        const varName = parts[0].replace('for ', '');
        const iterable = parts[1].replace(';', '').replace(' do', '');
        convertedLines.push(`for ${varName} in ${iterable}:`);
      } else {
        convertedLines.push(`# ${trimmedLine} - Manual conversion required`);
        warnings.push(`Complex for loop requires manual review: ${trimmedLine}`);
      }
      continue;
    }
    
    // While loops
    if (trimmedLine.startsWith('while ')) {
      const condition = trimmedLine.substring(6).replace(';', '').replace(' do', '');
      convertedLines.push(`while ${condition.replace('-lt', '<').replace('-gt', '>')}:`);
      continue;
    }
    
    // File operations
    if (trimmedLine.includes('cat ') && targetLanguage === "pyspark") {
      const filename = trimmedLine.replace('cat ', '');
      convertedLines.push(`df = spark.read.csv("${filename}", header=True)`);
      continue;
    }
    
    if (trimmedLine.includes('grep ') && targetLanguage === "pyspark") {
      const parts = trimmedLine.split('grep ');
      if (parts.length > 1) {
        const pattern = parts[1].split(' ')[0];
        convertedLines.push(`df.filter(df.value.contains("${pattern}"))`);
      }
      continue;
    }
    
    // Unsupported constructs
    if (trimmedLine.includes('awk ')) {
      unsupportedConstructs.push(`AWK command: ${trimmedLine}`);
      convertedLines.push(`# Unsupported construct: ${trimmedLine}`);
      convertedLines.push(`# Log: "Unsupported construct: awk"`);
      continue;
    }
    
    // Default case - add as comment
    convertedLines.push(`# ${trimmedLine}`);
    warnings.push(`Line may need manual conversion: ${trimmedLine}`);
  }
  
  convertedCode = convertedLines.join('\n');
  
  return {
    convertedCode,
    warnings,
    unsupportedConstructs
  };
}