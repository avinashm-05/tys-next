"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type Values = z.infer<typeof schema>;

/** Laravel-shaped 422 body ({ message, errors }) — includes the login lockout. */
type ServerError = { status: number; message?: string; errors?: Record<string, string[]> };

export function LoginForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    const { error } = await authClient.signIn.email(values);
    if (!error) {
      // Full navigation so the server sees the fresh session cookie.
      window.location.assign("/admin");
      return;
    }

    const { errors: fieldErrors, message, status } = error as unknown as ServerError;
    if (fieldErrors) {
      // 422 — including "Too many login attempts..." on the email field (R33).
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (field === "email" || field === "password") {
          form.setError(field, { type: "server", message: messages[0] });
        } else {
          toast.error(messages[0]);
        }
      }
    } else if (status === 401) {
      // Laravel's auth.failed, verbatim (05-auth).
      form.setError("email", {
        type: "server",
        message: "These credentials do not match our records.",
      });
    } else {
      toast.error(message ?? "Sign in failed. Try again.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Sign in</CardTitle>
        <CardDescription>Enter your email and password to open the admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tys-orange text-white hover:bg-tys-orange/90"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
