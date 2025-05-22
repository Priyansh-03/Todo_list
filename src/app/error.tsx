"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive text-center">Oops! Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-lg text-foreground/80">
            We encountered an unexpected issue. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
             <pre className="mt-2 p-2 text-left text-xs bg-muted rounded-md overflow-auto max-h-32 text-destructive-foreground">
               {error.message}
             </pre>
          )}
          <Button
            onClick={() => reset()}
            className="mt-6"
            size="lg"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
