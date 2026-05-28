import { apiURL } from "../utils/exports";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface UseFetchParams {
    endpoint?: string;
    isAuth?: boolean;
}

export const useFetch = ({ endpoint = "", isAuth = false }: UseFetchParams) => {
    const { token } = useSelector((state: RootState) => state.auth);

    const query = useQuery({
        // 1. FIXED QUERY KEY: Added token so it refetches if the user switches accounts
        queryKey: [endpoint, isAuth ? token : null], 
        
        // 2. PREVENT PREMATURE FETCHING: Don't fire the request if we need auth but don't have a token yet
        enabled: isAuth ? !!token : true,

        queryFn: async () => {
            // 3. SAFE URL COMBINATION
            const cleanBase = apiURL.endsWith('/') ? apiURL.slice(0, -1) : apiURL;
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
            const url = `${cleanBase}/${cleanEndpoint}`;

            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(isAuth && token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            // 4. SAFE JSON PARSING
            const textData = await response.text();
            let res_data;

            try {
                res_data = JSON.parse(textData);
            } catch (e) {
                console.error("Non-JSON response received in useFetch:", textData);
                throw new Error(`Server returned a non-JSON error: ${response.status}`);
            }

            if (!response.ok) {
                const errorMessage = res_data.error ? `${res_data.message} - ${res_data.error}` : res_data.message;
                throw new Error(errorMessage || "Fetch failed");
            }

            return res_data;
        },
    });
    return query;
}