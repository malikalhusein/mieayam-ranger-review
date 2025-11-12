import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SemanticDifferentialProps {
  id: string;
  label: string;
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
  value: number | undefined;
  onChange: (value: number) => void;
  className?: string;
}

export const SemanticDifferential = ({
  id,
  label,
  leftLabel,
  centerLabel,
  rightLabel,
  value,
  onChange,
  className
}: SemanticDifferentialProps) => {
  const steps = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="space-y-2">
        {/* Scale buttons */}
        <div className="flex gap-1 justify-between">
          {steps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-medium transition-all duration-200",
                "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                value === step
                  ? "bg-primary text-primary-foreground shadow-md scale-110"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              )}
              aria-label={`${label}: ${step}`}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-medium">{leftLabel}</span>
          <span className="font-medium">{centerLabel}</span>
          <span className="font-medium">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};
