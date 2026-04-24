import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode; // for action buttons on the right
}

export function PageHeader({ icon: Icon, title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={24} className="text-primary" />}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
