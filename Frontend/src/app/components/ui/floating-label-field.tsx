import * as React from "react";
import { cn } from "./utils";

type FloatingLabelTextareaProps = React.ComponentProps<"textarea"> & {
  label: string;
};

/**
 * Textarea with a label that floats on focus / when filled (placeholder must be a single space).
 */
export function FloatingLabelTextarea({
  id,
  label,
  className,
  value,
  ...props
}: FloatingLabelTextareaProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="relative">
      <textarea
        id={fieldId}
        value={value}
        placeholder=" "
        data-slot="floating-textarea"
        className={cn(
          "peer w-full resize-none rounded-xl border border-[rgba(82,109,130,0.25)] bg-white px-4 pb-3 pt-7 font-['Inter:Regular',sans-serif] text-[14px] text-foreground shadow-sm transition-[border-color,box-shadow] duration-300 ease-in-out outline-none",
          "placeholder:text-transparent",
          "hover:border-[rgba(39,55,77,0.35)]",
          "focus:border-primary focus:ring-[3px] focus:ring-primary/12",
          "aria-invalid:border-red-400 aria-invalid:ring-red-500/15",
          className,
        )}
        {...props}
      />
      <label
        htmlFor={fieldId}
        className={cn(
          "pointer-events-none absolute left-4 top-3.5 origin-[0] font-['Inter:Medium',sans-serif] text-[14px] text-muted-foreground transition-all duration-300 ease-in-out",
          "peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-foreground",
          "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11px]",
        )}
      >
        {label}
      </label>
    </div>
  );
}
