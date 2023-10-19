import { IconLoader } from "@tabler/icons-react";
import { useFormContext, useIsSubmitting } from "remix-validated-form";
import type { ButtonProps } from "~/components/ui/button";
import { Button } from "~/components/ui/button";

export function SubmitButton(props: ButtonProps) {
  const isSubmitting = useIsSubmitting();
  const { touchedFields } = useFormContext();
  const isDisabled = props.disabled || isSubmitting || !Object.keys(touchedFields).length;

  return (
    <Button {...props} type="submit" disabled={isDisabled}>
      {isSubmitting && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
      {props.children}
    </Button>
  );
}
