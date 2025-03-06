"use client";
import { useSearchParams } from "next/navigation";

export const useUrlWithSearchParams = () => {
  const searchParams = useSearchParams();
  const urlWithSearchParams = (url: string) => {
    const searchParamsString = new URLSearchParams(searchParams).toString();
    return `${url}?${searchParamsString}`;
  };
  return { urlWithSearchParams };
};
