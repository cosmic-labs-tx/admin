import { useEffect } from "react";
import type { ToastProps } from "~/components/ui/toast";
import { Toaster } from "~/components/ui/toaster";
import { useToast } from "~/components/ui/use-toast";

export function Notifications({ serverToast }: { serverToast: ToastProps }) {
  const { toast } = useToast();

  useEffect(() => {
    if (!serverToast) return;
    toast({ ...serverToast });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverToast]);

  return <Toaster />;
}
