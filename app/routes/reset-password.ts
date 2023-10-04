import type { ActionFunctionArgs } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { typedjson } from "remix-typedjson";
import { validationError } from "remix-validated-form";
import { z } from "zod";
import { sendPasswordResetEmail } from "~/server/mail.server";
import { deletePasswordReset, generatePasswordReset, getCurrentPasswordReset } from "~/server/password_reset.server";
import { toast } from "~/server/toast.server";
import { getUserByEmail } from "~/server/user.server";

const validator = withZod(z.object({ email: z.string().email() }));

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return typedjson({ status: 405 });
  }

  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);

  const user = await getUserByEmail(result.data.email);
  if (!user) {
    return validationError({
      fieldErrors: {
        email: "No user found with that email.",
      },
    });
  }

  const existingReset = await getCurrentPasswordReset({ userId: user.id });
  if (existingReset) {
    return validationError({
      fieldErrors: {
        email: "A password reset is already pending for this email.",
      },
    });
  }

  const reset = await generatePasswordReset({ email: user.email });
  const { data, error } = await sendPasswordResetEmail({ email: user.email, token: reset.token });

  // Unknown Resend error
  if (error || !data) {
    await deletePasswordReset({ token: reset.token });
    return toast.json(
      request,
      { error },
      {
        variant: "destructive",
        title: "Something went wrong",
        description: "There was an error sending the password reset email.",
      },
    );
  }

  // Email not sent
  if ("statusCode" in data && data.statusCode !== 200) {
    await deletePasswordReset({ token: reset.token });
    return toast.json(
      request,
      { data },
      {
        variant: "destructive",
        title: "Something went wrong",
        description: "There was an error sending the password reset email.",
      },
    );
  }

  // Success
  return toast.json(
    request,
    { data },
    {
      variant: "default",
      title: "Email sent 🎉",
      description: "Check this email for a link to reset the password.",
    },
  );
}
