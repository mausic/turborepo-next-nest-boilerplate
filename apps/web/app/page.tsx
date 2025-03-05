import { SignInButton, SignOutButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <main className="flex flex-col gap-4">
        Landing page
        <br />
        <Button>
          <SignInButton />
        </Button>
        <SignUpButton />
        <SignOutButton />
      </main>
    </div>
  );
}
