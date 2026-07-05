import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  backTo?: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  titleIcon?: ReactNode;
}

export function PageHeader({
  backTo = "/dashboard",
  backLabel = "Back to Home",
  title,
  subtitle,
  actions,
  titleIcon,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        to={backTo}
        className="group/back mb-4 inline-flex items-center gap-2 font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground transition-all duration-300 ease-in-out hover:gap-3 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover/back:-translate-x-0.5" />
        {backLabel}
      </Link>
      <div className="flex items-center justify-between">
        <div>
          {titleIcon && <div className="mb-2 flex items-center gap-3">{titleIcon}
            <h1 className="font-['Inter:Bold',sans-serif] text-[36px] font-bold text-primary">{title}</h1>
          </div>}
          {!titleIcon && (
            <h1 className="mb-2 font-['Inter:Bold',sans-serif] text-[36px] font-bold text-primary">{title}</h1>
          )}
          {subtitle && (
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
