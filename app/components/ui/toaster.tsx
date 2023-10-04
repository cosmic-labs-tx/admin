import { IconAlertCircleFilled, IconAlertTriangleFilled, IconCircleCheckFilled } from "@tabler/icons-react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import { cn } from "~/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className={cn("flex gap-3", description ? "items-start" : "items-center")}>
              <div>
                {variant === "default" ? (
                  <IconCircleCheckFilled className="h-6 w-6 text-success" />
                ) : variant === "destructive" ? (
                  <IconAlertCircleFilled className="h-6 w-6 text-white" />
                ) : (
                  <IconAlertTriangleFilled className="h-6 w-6 text-warning" />
                )}
              </div>
              <div>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
