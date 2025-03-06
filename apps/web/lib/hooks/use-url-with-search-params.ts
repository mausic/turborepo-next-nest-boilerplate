"use client";
import { useSearchParams } from "next/navigation";

export const useUrlWithSearchParams = () => {
  const searchParams = useSearchParams();
  console.log(searchParams);
  const urlWithSearchParams = (url: string) => {
    const searchParamsString = new URLSearchParams(searchParams).toString();
    console.log(searchParamsString);
    return `${url}?${searchParamsString}`;
  };
  return { urlWithSearchParams };
};
