import type { ReactNode } from "react";
import { useMinimumLoading } from "@/hooks";
import BaseLoader from "./BaseLoader";

interface BaseMinimumLoaderProps {
  isLoading: boolean;
  minimumTime?: number;
  children: ReactNode;
}

const BaseMinimumLoader = ({
  isLoading,
  minimumTime = 500,
  children,
}: BaseMinimumLoaderProps) => {
  const showLoader = useMinimumLoading(isLoading, minimumTime);

  if (showLoader) {
    return <BaseLoader />;
  }

  return <>{children}</>;
};

export default BaseMinimumLoader;
