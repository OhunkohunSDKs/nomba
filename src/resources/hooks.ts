import { AxiosError } from "axios";
import { ApiErrorResponse } from "../types/api-response.js";

export const useTryCatch = (debug?: boolean) => {
    const handles = {
         wrap: async <T>(callback: () => Promise<T> | T, onErrorCaught?: (err?: any) => Promise<T> | T): Promise<T | undefined> => {
            try {
                return await callback();
            }
            catch(err){
                if(debug) console.log('debug::useTryCatch.wrap', err);
                return await onErrorCaught?.(err);
            }
        },
    };
    return {...handles}
};
export const useAxiosError = () => {
    const handles = {
        rephrase: (error: AxiosError | undefined) => {
            const errorStatusMap: Record<string, number> = {
                ERR_NETWORK: 503,
                ENOTFOUND: 503,
                ECONNREFUSED: 503,
                ECONNRESET: 503,
                EHOSTUNREACH: 503,
                ENETUNREACH: 503,

                ECONNABORTED: 504,
                ETIMEDOUT: 504,

                SELF_SIGNED_CERT_IN_CHAIN: 502,
                DEPTH_ZERO_SELF_SIGNED_CERT: 502,
                UNABLE_TO_VERIFY_LEAF_SIGNATURE: 502,
                CERT_HAS_EXPIRED: 502,
                ERR_TLS_CERT_ALTNAME_INVALID: 502,

                ERR_INVALID_URL: 400,
                ERR_BAD_OPTION: 400,
                ERR_BAD_OPTION_VALUE: 400,

                ERR_CANCELED: 499,
            };
            const statusCode = (error?.code ? errorStatusMap[error.code] : undefined) || 500;
            const resp: ApiErrorResponse = {code: `${statusCode}`, description: `${error?.message || `API request could not be completed`}`, status: false};
            return resp;
        },
    };
    return {...handles};
};