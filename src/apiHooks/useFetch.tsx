import { apiURL } from "../utils/exports";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface UseFetchParams {
    endpoint?: string;
    isAuth?: boolean;
}

export const useFetch = ({ endpoint, isAuth = false }: UseFetchParams) => {
    const { token } = useSelector((state: RootState) => state.auth);

    const query = useQuery({
        queryKey: [endpoint],
        queryFn: async () => {
            const response = await fetch(`${apiURL}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(isAuth && token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const res_data = await response.json();

            if (!response.ok) {
                throw new Error(res_data.message || "Fetch failed");
            }

            return res_data;
        },
    });
    return query;
}