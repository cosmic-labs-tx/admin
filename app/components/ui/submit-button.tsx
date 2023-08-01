import { useIsSubmitting } from "remix-validated-form";
import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";

export function SubmitButton(props: ButtonProps) {
  const isSubmitting = useIsSubmitting();

  return (
    <Button {...props} type="submit" disabled={props.disabled || isSubmitting}>
      {props.children}
    </Button>
  );
}
