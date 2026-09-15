export interface NombaConfig {
    account_id: string;
    client_id: string;
    client_secret: string;
    environment: 'sandbox' | 'live';
    debug?: 'error';
}
