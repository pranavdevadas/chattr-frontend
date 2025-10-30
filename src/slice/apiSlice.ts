import { 
  createApi, 
} from '@reduxjs/toolkit/query/react';
import { baseQueryWithRefresh } from './baseQuery';



export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["User"],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endpoints: (builder) => ({}),
});