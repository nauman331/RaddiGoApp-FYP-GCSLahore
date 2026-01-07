import { apiURL } from "../utils/exports";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

interface UseSubmitParams {
    method?: string;
    endpoint?: string;
    isAuth?: boolean;
}

export const useSubmit = ({ method = "POST", endpoint, isAuth = false }: UseSubmitParams) => {
    const { token } = useSelector((state: RootState) => state.auth);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch(`${apiURL}${endpoint}`, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    ...(isAuth && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(data),
            });

            const res_data = await response.json();

            if (!response.ok) {
                throw new Error(res_data.message || "Submission failed");
            }

            return res_data;
        },
    });

    return mutation;
};