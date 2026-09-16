import { AxiosRequestConfig, create } from "axios";
import { ApiErrorResponse, ApiResponse } from "../types/api-response.js";
import { IssueAccessTokenRequestBody, IssueAccessTokenResponse, RefreshAccessTokenRequestBody, RefreshAccessTokenResponse, RevokeAccessTokenRequestBody, RevokeAccessTokenResponse } from "../types/auth.js";
import { BankAccountLookupRequestBody, BankAccountLookupResponse, BankTransferRequestBody, BankTransferResponse, ListBanksResponse } from "../types/bank.js";
import { CancelCheckoutOrderRequestBody, CancelCheckoutOrderResponse, CreateCheckoutOrderRequestBody, CreateCheckoutOrderResponse, RefundCheckoutTransactionRequestBody, RefundCheckoutTransactionResponse } from "../types/checkout.js";
import { NombaConfig } from "../types/config.js";
import { CreateSubAccountVirtualAccountResponse, CreateSubVirtualAccountRequestBody, CreateVirtualAccountRequestBody, CreateVirtualAccountResponse, ExpireVirtualAccountResponse, GetVirtualAccountResponse, ListVirtualAccountsQuery, ListVirtualAccountsRequestBody, ListVirtualAccountsResponse, LookupVirtualAccountResponse, SuspendVirtualAccountResponse, UpdateVirtualAccountRequestBody, UpdateVirtualAccountResponse } from "../types/virtual-account.js";
import { useAxiosError, useTryCatch } from "./hooks.js";

export const Nomba = (config: NombaConfig) => {
    const trycatch = useTryCatch(config.debug === 'error');
    const axiosError = useAxiosError();
    const req = create({
        baseURL: `https://${config.environment === 'live' ? 'api' : 'sandbox'}.nomba.com`,
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

    interface CallApiBaseProps {
        method: 'post' | 'get' | 'put' | 'delete';
        urlPath: string;
        body?: Record<string, any>;
        query?: Record<string, any>;
        headers?: AxiosRequestConfig['headers'];
        version?: 1 | 2;
    }

    //default api call;
    const callApiBase = async <Response extends ApiResponse> (props: CallApiBaseProps) => {
        const resp = await trycatch.wrap<ApiResult<Response['data']>>(async () => {
            const urlPath = `/v${props.version ?? 1}${props.urlPath}`;
            const resp = await (
                props.method === 'delete' ? req[props.method](urlPath, {headers: props.headers, params: props.query}) :
                props.method === 'put' ? req[props.method](urlPath, props.body, {headers: props.headers, params: props.query}) :
                props.method === 'post' ? req[props.method](urlPath, props.body, {headers: props.headers, params: props.query}) :
                req[props.method](urlPath, {headers: props.headers, params: props.query})
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
    const callApi = async <Response extends ApiResponse> (method: CallApiBaseProps['method'], urlPath: CallApiBaseProps['urlPath'], options?: Pick<CallApiBaseProps, 'body' | 'query' | 'version'> & {omitToken?: boolean}) => {
        const headers: AxiosRequestConfig['headers'] = {};
        if(options?.omitToken !== true){
            await init.defineToken();
            headers.Authorization = `Bearer ${accessToken}`; //include token by default;
        }
        return await callApiBase<Response>({method, urlPath, body: options?.body, query: options?.query, headers});
    };
    
    const handles = {
        access_token: {
            issue: async (body: IssueAccessTokenRequestBody) => await callApi<IssueAccessTokenResponse>('post', `/auth/token/issue`, {body: {client_id: config.client_id, client_secret: config.client_secret, ...body}, omitToken: true}),
            refresh: async (body: RefreshAccessTokenRequestBody) => await callApi<RefreshAccessTokenResponse>('post', `/auth/token/refresh`, {body}),
            revoke: async (body: RevokeAccessTokenRequestBody) => await callApi<RevokeAccessTokenResponse>('post', `/auth/token/revoke`, {body: {clientId: config.client_id, ...body}, omitToken: true}),
        },
        virtual_account: {
            create: async (body: CreateVirtualAccountRequestBody) => await callApi<CreateVirtualAccountResponse>('post', `/accounts/virtual`, {body}),
            create_sub_account: async (subAccountId: string, body: CreateSubVirtualAccountRequestBody) => await callApi<CreateSubAccountVirtualAccountResponse>('post', `/accounts/virtual/${subAccountId}`, {body}),
            list: async (query?: ListVirtualAccountsQuery, body?: ListVirtualAccountsRequestBody) => await callApi<ListVirtualAccountsResponse>('post', `/accounts/virtual/list`, {body, query}),
            
            get: async (/** Account reference or virtual account number. */ virtualAccountIdentifier: string) => await callApi<GetVirtualAccountResponse>('get', `/accounts/virtual/${virtualAccountIdentifier}`),
            update: async (/** Account reference or virtual account number. */ virtualAccountIdentifier: string, body: UpdateVirtualAccountRequestBody) => await callApi<UpdateVirtualAccountResponse>('put', `/accounts/virtual/${virtualAccountIdentifier}`, {body}),
            expire: async (/** Account reference or virtual account number. */ virtualAccountIdentifier: string) => await callApi<ExpireVirtualAccountResponse>('delete', `/accounts/virtual/${virtualAccountIdentifier}`),

            // suspend: async () => await callApi<SuspendVirtualAccountResponse>('put', `/accounts/suspend/${config.account_id}`),
            suspend: async (accountId: string) => await callApi<SuspendVirtualAccountResponse>('put', `/accounts/suspend/${accountId}`),
            lookup: async (/** Account reference or virtual account number. */ virtualAccountIdentifier: string) => await callApi<LookupVirtualAccountResponse>('get', `/accounts/virtual/${virtualAccountIdentifier}`),
        },
        checkout: {
            create: async (body: CreateCheckoutOrderRequestBody) => await callApi<CreateCheckoutOrderResponse>('post', `/checkout/order`, {body}),
            cancel: async (body: CancelCheckoutOrderRequestBody) => await callApi<CancelCheckoutOrderResponse>('post', `/checkout/order/cancel`, {body}),
            refund: async (body: RefundCheckoutTransactionRequestBody) => await callApi<RefundCheckoutTransactionResponse>('post', `/checkout/order/refund`, {body}),
        },
        bank: {
            list: async () => await callApi<ListBanksResponse>('get', `/transfers/banks`),
            account_lookup: async (body: BankAccountLookupRequestBody) => await callApi<BankAccountLookupResponse>('post', `/transfers/banks/lookup`, {body}),
            transfer: async (body: BankTransferRequestBody) => await callApi<BankTransferResponse>('post', `/transfers/banks/lookup`, {body, version: 2}),
        },
    };

    return {...handles};
};