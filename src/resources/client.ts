import { AxiosRequestConfig, create } from "axios";
import { ApiErrorResponse, ApiResponse } from "../types/api-response.js";
import { IssueAccessTokenRequestBody, IssueAccessTokenResponse, RefreshAccessTokenRequestBody, RefreshAccessTokenResponse, RevokeAccessTokenRequestBody, RevokeAccessTokenResponse } from "../types/auth.js";
import { CreateCheckoutOrderRequestBody, CreateCheckoutOrderResponse } from "../types/checkout.js";
import { NombaConfig } from "../types/config.js";
import { CreateSubAccountVirtualAccountResponse, CreateSubVirtualAccountRequestBody, CreateVirtualAccountRequestBody, CreateVirtualAccountResponse, ExpireVirtualAccountResponse, GetVirtualAccountResponse, ListVirtualAccountsQuery, ListVirtualAccountsRequestBody, ListVirtualAccountsResponse, LookupVirtualAccountResponse, SuspendVirtualAccountResponse, UpdateVirtualAccountRequestBody, UpdateVirtualAccountResponse } from "../types/virtual-account.js";
import { useAxiosError, useTryCatch } from "./hooks.js";

export const Nomba = (config: NombaConfig) => {
    const trycatch = useTryCatch(config.debug === 'error');
    const axiosError = useAxiosError();
    const req = create({
        baseURL: `https://${config.environment === 'live' ? 'api' : 'sandbox'}.nomba.com/v1`,
        headers: {
            "Content-Type": "application/json",
            "accountId": config.account_id,
        },
    });
    let accessToken: string | undefined;
    
    const init = {//init isn't exposed, as it's only used within the hook;
        defineToken: async () => {
            if(!accessToken){
                const resp = await handles.access_token.issue({grant_type: 'client_credentials'});
                if(resp.status){
                    accessToken = resp.data?.access_token;
                }
            }
        },
    };


    type ApiResult<ResponseDataType> =
    | ApiResponse<ResponseDataType>
    | ApiErrorResponse

    interface CallApiOptions {omitToken?: boolean}
    interface CallApiBaseProps {
        method: 'post' | 'get' | 'put' | 'delete';
        urlPath: string;
        body?: Record<string, any>;
        query?: Record<string, any>;
        headers?: AxiosRequestConfig['headers'];
    }

    //default api call;
    const callApiBase = async <ResponseDataType> (props: CallApiBaseProps) => {
        const resp = await trycatch.wrap<ApiResult<ResponseDataType>>(async () => {
            const resp = await (
                props.method !== 'get' ? req[props.method](props.urlPath, {account_id: config.account_id, ...props.body}, {headers: props.headers, params: props.query}) :
                req.get(props.urlPath, {params: {account_id: config.account_id, ...props.query}, headers: props.headers})
            );

            return resp?.data ?? {};
        }, (error) => {
            let resp = axiosError.rephrase(error); //output default failure response; in case of client error, and request couldn't reach the endpoint;
            if(error?.response?.data) resp = error?.response?.data;
            return resp;
        });

        const defaultFailure: ApiErrorResponse = {code: "500", description: `API request could not be completed`, status: false};
        const response = resp ?? defaultFailure;
        response.status = response.status ?? response.code === '00'; //it's been observed not all responses from nomba has the "status" field; since the "code" field is present, it's used to conclude the status value;

        return response;
    };

    //calls api with token check;
    const callApi = async <ResponseDataType> (method: CallApiBaseProps['method'], urlPath: CallApiBaseProps['urlPath'], data?: Pick<CallApiBaseProps, 'body' | 'query'>, options?: CallApiOptions) => {
        const headers: AxiosRequestConfig['headers'] = {};
        if(options?.omitToken !== true){
            await init.defineToken();
            headers.Authorization = `Bearer ${accessToken}`; //include token by default;
        }
        return await callApiBase<ResponseDataType>({method, urlPath, body: data?.body, query: data?.query, headers});
    };
    
    const handles = {
        access_token: {
            issue: async (body: IssueAccessTokenRequestBody) => await callApi<IssueAccessTokenResponse['data']>('post', `/auth/token/issue`, {body: {client_id: config.client_id, client_secret: config.client_secret, ...body}}, {omitToken: true}),
            refresh: async (body: RefreshAccessTokenRequestBody) => await callApi<RefreshAccessTokenResponse['data']>('post', `/auth/token/refresh`, {body}),
            revoke: async (body: RevokeAccessTokenRequestBody) => await callApi<RevokeAccessTokenResponse['data']>('post', `/auth/token/revoke`, {body: {clientId: config.client_id, ...body}}, {omitToken: true}),
        },
        virtual_account: {
            create: async (body: CreateVirtualAccountRequestBody) => await callApi<CreateVirtualAccountResponse['data']>('post', `/accounts/virtual`, {body}),
            create_sub_account: async (subAccountId: string, body: CreateSubVirtualAccountRequestBody) => await callApi<CreateSubAccountVirtualAccountResponse['data']>('post', `/accounts/virtual/${subAccountId}`, {body}),
            list: async (query?: ListVirtualAccountsQuery, body?: ListVirtualAccountsRequestBody) => await callApi<ListVirtualAccountsResponse['data']>('post', `/accounts/virtual/list`, {body, query}),
            
            //virtualAccountIdentifier = account reference or virtual account number;
            get: async (virtualAccountIdentifier: string) => await callApi<GetVirtualAccountResponse['data']>('get', `/accounts/virtual/${virtualAccountIdentifier}`),
            update: async (virtualAccountIdentifier: string, body: UpdateVirtualAccountRequestBody) => await callApi<UpdateVirtualAccountResponse['data']>('put', `/accounts/virtual/${virtualAccountIdentifier}`, {body}),
            expire: async (virtualAccountIdentifier: string) => await callApi<ExpireVirtualAccountResponse['data']>('delete', `/accounts/virtual/${virtualAccountIdentifier}`),

            suspend: async () => await callApi<SuspendVirtualAccountResponse['data']>('put', `/accounts/suspend/${config.account_id}`),
            lookup: async (virtualAccountNumber: string) => await callApi<LookupVirtualAccountResponse['data']>('get', `/accounts/virtual/${virtualAccountNumber}`),
        },
        checkout: {
            create: async (body: CreateCheckoutOrderRequestBody) => await callApi<CreateCheckoutOrderResponse['data']>('post', `/checkout/order`, {body}),
        },
    };

    return {...handles};
};