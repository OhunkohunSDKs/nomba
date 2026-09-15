
export interface ApiResponse<ResponseDataType = unknown> {
    code?: string;
    description?: string;
    status?: boolean;
    data?: ResponseDataType;
}
export interface ApiErrorResponse extends Omit<ApiResponse, 'data' | 'status'> {
    status: false;
}
