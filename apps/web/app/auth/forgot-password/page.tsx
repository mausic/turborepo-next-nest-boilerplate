"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icons,
  InputEmail,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  InputPassword,
  Separator,
} from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession, useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUrlWithSearchParams } from "@/lib/hooks/use-url-with-search-params";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
type IForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordCodeSchema = z
  .object({
    code: z.string().length(6),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
type IForgotPasswordCodeSchema = z.infer<typeof ForgotPasswordCodeSchema>;

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session } = useSession();
  const { urlWithSearchParams } = useUrlWithSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const { isLoaded, setActive, signIn } = useSignIn();
  const [isCodeSent, setIsCodeSent] = React.useState(false);
  const [isResendAvailable, setIsResendAvailable] = React.useState(false);
  const form = useForm<IForgotPasswordSchema>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const formCode = useForm<IForgotPasswordCodeSchema>({
    resolver: zodResolver(ForgotPasswordCodeSchema),
    defaultValues: {
      code: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const catchErrors = (error: unknown) => {
    if (isClerkAPIResponseError(error)) {
      error.errors.forEach((_error) => {
        switch (_error.code) {
          case "form_identifier_not_found":
            form.setError("email", {
              message: "User with such email does not exist. Try sign up instead",
            });
            return;
          case "verification_expired":
            formCode.setError("code", { message: "Code has expired. Please try again" });
            setIsResendAvailable(true);
            return;
          case "form_code_incorrect":
            formCode.setError("code", { message: "Code is incorrect" });
            setIsResendAvailable(true);
            return;
          case "form_password_pwned":
            formCode.setError("password", { message: _error.longMessage });
            return;
          default:
            console.error(JSON.stringify(_error, null, 2));
            toast.error(`Could not reset password: ${_error.longMessage}`);
            return;
        }
      });
    } else {
      console.error(JSON.stringify(error, null, 2));
      toast.error("Could not reset password. Please contact support");
    }
  };
  const onSubmitEmail = async (data: IForgotPasswordSchema) => {
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    try {
      await signIn.create({
        identifier: data.email,
        strategy: "reset_password_email_code",
      });
      setIsCodeSent(true);
    } catch (error) {
      catchErrors(error);
    } finally {
      setIsLoading(false);
    }
  };
  const onSubmitCode = async (data: IForgotPasswordCodeSchema) => {
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    try {
      const signinResponse = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      });
      if (signinResponse.status === "complete") {
        await setActive({ session: signinResponse.createdSessionId });
        toast.success("Password reset successfully");
        const route = searchParams.get("redirect_url") || "/";
        router.push(route);
      } else {
        console.error("sign in failed", JSON.stringify(signinResponse, null, 2));
        toast.error("Password reset failed. Please contact support");
      }
    } catch (error) {
      catchErrors(error);
    } finally {
      setIsLoading(false);
    }
  };
  const onResentCode = async () => {
    setIsResendAvailable(false);
    await onSubmitEmail(form.getValues());
  };
  React.useEffect(() => {
    if (session) {
      const route = searchParams.get("redirect_url") || "/";
      router.push(route);
    }
  }, [session, searchParams, router]);

  if (isCodeSent) {
    return (
      <Card key="code" className="w-full sm:w-96">
        <CardHeader>
          <CardTitle>Enter code</CardTitle>
          <CardDescription>Enter the code we sent to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formCode}>
            <form onSubmit={formCode.handleSubmit(onSubmitCode)} className="grid gap-4">
              <FormField
                control={formCode.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-center">
                    <FormControl>
                      <InputOTP maxLength={6} {...field} autoFocus pattern={REGEXP_ONLY_DIGITS}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} autoFocus />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={formCode.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <InputPassword {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="passwordConfirmation"
                control={formCode.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <InputPassword {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Icons.spinner className="size-4 animate-spin" /> : "Verify code"}
              </Button>
              {isResendAvailable && (
                <Button type="button" onClick={onResentCode} disabled={isLoading} variant={"link"}>
                  {isLoading ? <Icons.spinner className="size-4 animate-spin" /> : "Resend code"}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card key="email" className="w-full sm:w-96">
      <CardHeader>
        <CardTitle>Password recovery</CardTitle>
        <CardDescription>Enter your email to recover password</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitEmail)} className="grid gap-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <InputEmail {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Icons.spinner className="size-4 animate-spin" /> : "Send code"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="w-full flex items-center justify-center">
          <Button variant={"link"} className="text-sm text-muted-foreground">
            <Link href={urlWithSearchParams("/auth/sign-in")}>Sign in</Link>
          </Button>
          <Button variant={"link"} className="text-sm text-muted-foreground">
            <Link href={urlWithSearchParams("/auth/sign-up")}>Sign up</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
