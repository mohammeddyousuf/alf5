import { useSearchParams } from "react-router-dom";

export const useShopUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateUrlParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  };

  const getUrlParam = (key: string) => searchParams.get(key);

  return {
    updateUrlParams,
    getUrlParam,
    searchParams
  };
};