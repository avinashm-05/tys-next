"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    // Always the neutral screen, even on failure (anti-enumeration): the
    // server swallows send errors too (src/lib/mail), so a mail outage never
    // reveals whether the account exists. Failures land in the server log.
    await authClient.requestPasswordReset({ email: values.email });
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Check your email</CardTitle>
          <CardDescription>
            If {sentTo} has a staff account, a reset link is on its way. It expires in 60 minutes.
            Nothing within 2 minutes? Check your spam folder, or ask the owner to check your access
            on the Staff page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to set a new password.
        </CardDescription>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tys-blue text-white hover:bg-tys-blue/90"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
            <Link
              href="/login"
              className="text-center text-xs text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
