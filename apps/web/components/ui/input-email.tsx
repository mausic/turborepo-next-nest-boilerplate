import { MailIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

function InputEmail({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        type="email"
        autoComplete="email"
        placeholder="mailbox@mail.com"
        className={cn(className, "pl-10")}
        {...props}
      />
    </div>
  );
}

export { InputEmail };
