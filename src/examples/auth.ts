import { ApiResponse, Nomba, NombaConfig } from "../index.js";

export const authExamples = () => {
    
    //configure;
    const config: NombaConfig = {
        account_id: process.env.ACCOUNT_ID!,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        environment: process.env.ENVIRONMENT! as NombaConfig['environment'],
        debug: 'error',
    };
    const client = Nomba(config);

    const init = {
        logResponse: (response: ApiResponse | undefined) => {
            if(response?.status){
                //the response from successful endpoint call;
                console.log('success::', response);
            }
            else {
                //the response from failed endpoint call;
                console.log('failure::', response);
            }
        },
    };
    const handles = {
        issueAccessToken: async () => {
            const response = await client.access_token.issue({
                grant_type: 'client_credentials',
            });
            init.logResponse(response);
            return response;
        },
        revokeAccessToken: async () => {
            const response = await client.access_token.revoke({
                access_token: process.env.ACCESS_TOKEN!,
            });
            init.logResponse(response);
            return response;
        },
    };

    return {...handles};
};