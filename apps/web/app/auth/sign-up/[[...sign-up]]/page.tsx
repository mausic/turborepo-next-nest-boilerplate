"use client";

import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { PhoneIcon, BuildingIcon } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Icons,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
  CardFooter,
  InputPassword,
  InputEmail,
} from "@/components/ui";
import { createUser } from "@/actions/user";
import Link from "next/link";
import { useUrlWithSearchParams } from "@/lib/hooks/use-url-with-search-params";
import { useRedirectUrl } from "@/lib/hooks/use-redirect-url";

const SignUpSchema = z
  .object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    phoneNumber: z.string().nonempty(),
    emailAddress: z.string().email(),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string().min(8),
    organization: z.string().nonempty(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ISignUpSchema = z.infer<typeof SignUpSchema>;

const SignUpConfirmSchema = z.object({
  code: z.string().length(6),
});
type ISignUpConfirmSchema = z.infer<typeof SignUpConfirmSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { urlWithSearchParams } = useUrlWithSearchParams();
  const { redirectUrl } = useRedirectUrl();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verifying, setVerifying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<ISignUpSchema>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailAddress: "",
      password: "",
      confirmPassword: "",
      organization: "",
    },
  });
  const formConfirm = useForm<ISignUpConfirmSchema>({
    resolver: zodResolver(SignUpConfirmSchema),
    defaultValues: {
      code: "",
    },
  });
  /**
   * Handle sign up form submission
   * @param data form data with sign up details
   */
  const onSignup = async (data: ISignUpSchema) => {
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: data.emailAddress,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        unsafeMetadata: {
          organization: data.organization,
          phoneNumber: data.phoneNumber,
        },
      });
      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
    } catch (e) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (isClerkAPIResponseError(e)) {
        e.errors.forEach((error) => {
          switch (error.code) {
            case "form_identifier_exists":
              form.setError("emailAddress", {
                message: error.longMessage,
                type: "validate",
              });
              break;
            case "form_password_length_too_short":
              form.setError("password", {
                message: error.longMessage,
                type: "minLength",
              });
              break;
            case "form_password_length_too_long":
              form.setError("password", {
                message: error.longMessage,
                type: "maxLength",
              });
              break;
            default:
              console.error(JSON.stringify(e, null, 2));
              toast.error(error.longMessage);
              break;
          }
        });
      } else {
        console.error(JSON.stringify(e, null, 2));
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * Handle verification code form submission
   * @param data form data with verification code
   */
  const onCodeSubmit = async (data: ISignUpConfirmSchema) => {
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });
      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        // create user entry in the database
        await createUser({
          firstName: form.getValues().firstName,
          lastName: form.getValues().lastName,
          email: form.getValues().emailAddress,
          phoneNumber: form.getValues().phoneNumber,
          organization: form.getValues().organization,
          clerkId: signUpAttempt.createdUserId!,
        });
        // set active web session
        await setActive({ session: signUpAttempt.createdSessionId });
        // redirect user to the page they were on
        router.push(redirectUrl);
      } else {
        toast.error("Error verifying email address. Please try again.");
      }
    } catch (e) {
      if (isClerkAPIResponseError(e)) {
        e.errors.forEach((error) => {
          switch (error.code) {
            case "form_code_incorrect":
              formConfirm.setError("code", {
                message: error.longMessage,
                type: "validate",
              });
              break;
            default:
              console.error(JSON.stringify(e, null, 2));
              toast.error(error.longMessage);
              break;
          }
        });
      } else {
        console.error(JSON.stringify(e, null, 2));
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full sm:w-96">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>Use the verification code sent to your email address</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formConfirm}>
            <form onSubmit={formConfirm.handleSubmit(onCodeSubmit)} className="grid gap-y-4">
              <FormField
                control={formConfirm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-center">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        autoFocus={true}
                        pattern={REGEXP_ONLY_DIGITS}>
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
              <Separator />
              <Button type="submit" disabled={!formConfirm.formState.isValid || isLoading}>
                {isLoading ? <Icons.spinner className="size-4 animate-spin" /> : "Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center">
      <Card className="w-full sm:w-96">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Welcome! Please fill in the details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSignup)} className="grid gap-y-4">
              <div className="grid gap-x-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="given-name"
                          autoCapitalize="words"
                          placeholder="John"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          autoComplete="family-name"
                          autoCapitalize="words"
                          placeholder="Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BuildingIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          type="text"
                          autoComplete="organization"
                          placeholder="ACME Corp"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1234567890"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailAddress"
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <InputPassword {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* CAPTCHA Widget */}
              <div id="clerk-captcha"></div>
              <Separator />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Icons.spinner className="size-4 animate-spin" /> : "Sign up"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            Already have an account?&nbsp;
            <Link href={urlWithSearchParams("/auth/sign-in")} className="underline text-blue-400">
              Sign in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
