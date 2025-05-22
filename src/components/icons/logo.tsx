import type { SVGProps } from "react";
import { ListChecks, Sparkles } from "lucide-react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="Todo Summary Assistant Logo">
      <ListChecks className="h-8 w-8 text-primary" />
      <Sparkles className="h-6 w-6 text-accent" />
    </div>
  );
}
