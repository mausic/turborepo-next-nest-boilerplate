"use client";

import * as React from "react";
import { siteConfig } from "@/config/site-config";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSession, useSignIn } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  InputPassword,
  Separator,
} from "@/components/ui";
import Link from "next/link";
import { toast } from "sonner";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useUrlWithSearchParams } from "@/lib/hooks/use-url-with-search-params";
import { useRedirectUrl } from "@/lib/hooks/use-redirect-url";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type ISignInSchema = z.infer<typeof SignInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const { session } = useSession();
  const { urlWithSearchParams } = useUrlWithSearchParams();
  const { redirectUrl } = useRedirectUrl();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<ISignInSchema>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSignin = async (data: ISignInSchema) => {
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push(redirectUrl);
      } else {
        console.error("sign in failed", JSON.stringify(signInAttempt, null, 2));
        toast.error("Sign in failed. Please contact support");
      }
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        e.errors.forEach((error) => {
          switch (error.code) {
            case "form_password_incorrect":
              form.setError("password", { message: "Password is incorrect" });
              break;
            case "form_identifier_not_found":
              form.setError("email", { message: "User with such email does not exists" });
              break;
            default:
              toast.error(`Sign in failed: ${error.longMessage}`);
              break;
          }
        });
      }
      console.error(JSON.stringify(e, null, 2));
      toast.error("Sign in failed: ");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (session) {
      router.push(redirectUrl);
    }
  }, [redirectUrl, router, session]);

  return (
    <Card className="w-full sm:w-96">
      <CardHeader>
        <CardTitle>Sign in to {siteConfig.name}</CardTitle>
        <CardDescription>Welcome back! Please sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSignin)} className="grid gap-y-4">
            <FormField
              control={form.control}
              name="email"
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <InputPassword {...field} autoComplete="current-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Link
              href={urlWithSearchParams("/auth/forgot-password")}
              className="text-blue-400 underline text-sm">
              Forgot password?
            </Link>
            <Separator />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Icons.spinner className="size-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?&nbsp;
          <Link href={urlWithSearchParams("/auth/sign-up")} className="underline text-blue-400">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
