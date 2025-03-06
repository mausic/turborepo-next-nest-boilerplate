import { Onboarding } from "@/components/onboarding";
import { useSession, useUser } from "@clerk/nextjs";
import { prisma } from "@repo/db";

export default async function OnboardingPage() {
  const { user } = useUser();
  const userInfo = await prisma.user.findFirst({
    where: {
      clerkId: user?.id,
    },
    select: {
      organization: true,
    },
  });
  return <Onboarding organizationName={userInfo?.organization} />;
}
