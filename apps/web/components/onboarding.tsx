"use client";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "./ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingIcon } from "lucide-react";

const OrganizationFormSchema = z.object({
  organizationName: z.string().nonempty(),
});
type IOrganizationFormSchema = z.infer<typeof OrganizationFormSchema>;

interface IOnboardingProps {
  organizationName?: string | undefined;
}

export const Onboarding = ({ organizationName }: IOnboardingProps) => {
  const form = useForm<IOrganizationFormSchema>({
    resolver: zodResolver(OrganizationFormSchema),
    defaultValues: {
      organizationName: organizationName || "",
    },
  });
  const onSubmitOrganization = (data: IOrganizationFormSchema) => {
    console.log(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitOrganization)}>
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <div className="relative">
                  <BuildingIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="text"
                    {...field}
                    className="pl-10"
                    placeholder="Acme Inc."
                    autoComplete="organization"
                    autoFocus
                  />
                </div>
              </FormControl>
              <FormDescription>Enter your organization name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
