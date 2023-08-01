import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SubmitButton } from "~/components/ui/submit-button";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

const validator = withZod(
  z.object({
    email: z.string().min(1, { message: "Email is required" }).email(),
    password: z
      .string()
      .min(8, { message: "Password must be 8 or more characters." }),
  })
);

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const result = await validator.validate(formData);
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (result.error) {
    return json(validationError(result.error), { status: 400 });
  }

  const { email, password } = result.data;
  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
  });
};

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  return (
    <div className="mx-auto h-full w-full max-w-lg px-8 pt-[25%]">
      <h1 className="text-center  text-4xl font-extrabold md:text-5xl">
        Friendly Bear Labs
      </h1>
      <ValidatedForm
        validator={validator}
        method="post"
        className="mt-12 space-y-2"
      >
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <SubmitButton size="lg" className="w-full">
          Log in
        </SubmitButton>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>
        </div>
      </ValidatedForm>
    </div>
  );
}
