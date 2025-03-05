import { ThemeSwitcher } from "@/components/theme-switcher";
import * as React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="pt-10 px-20 flex justify-end items-center w-full">
        <ThemeSwitcher />
      </div>
      <div className="flex items-center justify-center w-full h-full">{children}</div>
    </div>
  );
};

export default AuthLayout;
