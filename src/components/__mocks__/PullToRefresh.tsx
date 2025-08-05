import { ReactNode } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
  disabled?: boolean;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  return <>{children}</>;
}
