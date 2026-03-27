import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  readonly title: string;
  readonly value: number;
  readonly icon: LucideIcon;
  readonly color: string;
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="flex items-center gap-4">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="size-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-carbon/60">{title}</p>
          <p className="text-2xl font-heading font-semibold text-carbon">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
