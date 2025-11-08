import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // baseUrl: "http://192.168.220.3:5000",
  baseUrl: "https://ocrsystem.site",
  credentials: "include",
});

export const baseQueryWithRefresh = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery("/api/user/refresh", api, extraOptions);

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch({ type: "user/logout" });
    }
  }

  return result;
};
