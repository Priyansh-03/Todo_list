"use client";

import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { Send, Loader2, Wand2 } from "lucide-react";

interface AppHeaderProps {
  onSummarize: () => void;
  isSummarizing: boolean;
}

export const AppHeader: FC<AppHeaderProps> = ({ onSummarize, isSummarizing }) => {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-2xl font-semibold text-primary">Todo Summary Assistant</h1>
        </div>
        <Button onClick={onSummarize} disabled={isSummarizing} size="lg">
          {isSummarizing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-5 w-5" />
          )}
          Summarize & Send to Slack
        </Button>
      </div>
    </header>
  );
};
