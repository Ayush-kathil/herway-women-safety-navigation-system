"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />,
});

export default MapComponent;
