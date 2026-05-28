import { apiURL } from "../utils/exports";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface UseSubmitParams {
    method?: string;
    endpoint?: string;
    isAuth?: boolean;
}

export const useSubmit = ({ method = "POST", endpoint = "", isAuth = false }: UseSubmitParams) => {
    const { token } = useSelector((state: RootState) => state.auth);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // 1. Safely combine URLs to prevent missing slashes
            const cleanBase = apiURL.endsWith('/') ? apiURL.slice(0, -1) : apiURL;
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
            const url = `${cleanBase}/${cleanEndpoint}`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...(isAuth && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(data),
            });

            // 2. Read the raw text first instead of forcing .json()
            const textData = await response.text();
            let res_data;

            try {
                // 3. Try to parse it as JSON safely
                res_data = JSON.parse(textData);
            } catch (e) {
                // If it fails, log the raw HTML/text so you can see the REAL backend error
                console.error("Non-JSON response received:", textData);
                throw new Error(`Server returned a non-JSON error: ${response.status}`);
            }

            console.log("API Response:", res_data);

            if (!response.ok) {
                // Grab the detailed error message we added to the backend earlier
                const errorMessage = res_data.error ? `${res_data.message} - ${res_data.error}` : res_data.message;
                throw new Error(errorMessage || "Submission failed");
            }

            return res_data;
        },
    });

    return mutation;
};