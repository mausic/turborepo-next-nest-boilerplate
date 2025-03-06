import { useSearchParams } from "next/navigation";

export const useRedirectUrl = () => {
  const searchParams = useSearchParams();
  return {
    redirectUrl: decodeURIComponent(searchParams.get("redirect_url") || "/"),
  };
};
