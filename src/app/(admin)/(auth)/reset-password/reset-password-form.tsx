"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const schema = z
  .object({
    // Better Auth's default minimum, same as Laravel's Password::defaults().
    password: z.string().min(8, "The password must be at least 8 characters."),
    passwordConfirmation: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "The password confirmation does not match.",
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [tokenRejected, setTokenRejected] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });
    if (error) {
      if (error.code === "INVALID_TOKEN") setTokenRejected(true);
      else toast.error(error.message ?? "Couldn't set the new password. Try again.");
      return;
    }
    toast.success("Password updated. Sign in with your new password.");
    router.push("/login");
  }

  if (tokenRejected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Reset link invalid</CardTitle>
          <CardDescription>
            This reset link is invalid or has expired. Request a new one to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Set new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field data-invalid={!!errors.passwordConfirmation}>
              <FieldLabel htmlFor="password-confirmation">Confirm new password</FieldLabel>
              <Input
                id="password-confirmation"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.passwordConfirmation}
                {...form.register("passwordConfirmation")}
              />
              <FieldError errors={[errors.passwordConfirmation]} />
            </Field>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tys-blue text-white hover:bg-tys-blue/90"
            >
              {isSubmitting ? "Saving…" : "Set new password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
