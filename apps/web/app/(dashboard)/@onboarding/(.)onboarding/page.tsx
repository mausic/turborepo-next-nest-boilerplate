import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Onboarding } from "@/components/onboarding";
import { siteConfig } from "@/config/site-config";

export default function OnboardingModalPage() {
  return (
    <Dialog open={true} modal>
      <DialogContent closeButtonHidden>
        <DialogHeader>
          <DialogTitle>Welcome to {siteConfig.name}</DialogTitle>
          <DialogDescription>
            While we are preparing your account, please fill out some info
          </DialogDescription>
        </DialogHeader>
        <Onboarding />
      </DialogContent>
    </Dialog>
  );
}
