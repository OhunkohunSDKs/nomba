import { ApiResponse } from "./api-response.js";
import { Currency } from "./checkout.js";

/** Supported identifier types for a virtual account. */
export type VirtualAccountIdentifierType =
  | "BVN"
  | "NIN"
  | "BVN_AND_NIN";

/** Common details returned for a virtual account. */
export interface VirtualAccountData {
  /** Creation timestamp. */
  createdAt: string;

  /** Account reference. */
  accountRef: string;

  /** Account holder ID. */
  accountHolderId: string;

  /** Account holder's name. */
  accountName: string;

  /** Currency code. */
  currency: Currency;

  /** Bank account number. */
  bankAccountNumber: string;

  /** Bank account holder name. */
  bankAccountName: string;

  /** Bank name. */
  bankName: string;

  /** Bank Verification Number (BVN). */
  bvn: string;

  /** Callback URL. */
  callbackUrl?: string;

  /** Whether the virtual account is expired or not. */
  expired: boolean;
}

/** Additional details returned after creating a virtual account. */
export interface CreatedVirtualAccountData extends VirtualAccountData {
  /**
   * The type of identifier the virtual account was created against.
   * Omitted when the account has no identifier.
   */
  identifierType?: VirtualAccountIdentifierType;
}

/** Details used to create a virtual account. */
export interface CreateVirtualAccountRequestBody {
  /**
   * Account reference.
   * Required string length: 16 - 64.
   */
  accountRef: string;

  /**
   * Account holder's name.
   * Required string length: 8 - 64.
   */
  accountName: string;

  /**
   * Currency code.
   * Available options: NGN.
   */
  currency: Currency;

  /** Account holder's BVN. Optional. */
  bvn?: string;

  /**
   * Account holder's National Identification Number (NIN). Optional.
   * Must be exactly 11 digits.
   * Can be sent on its own or alongside bvn.
   * If neither is sent, the BVN on the parent business account is used.
   */
  nin?: string;

  /**
   * Amount the account can receive. Optional.
   */
  expectedAmount?: number;

  /**
   * Account expiry date. Optional.
   *
   * Example: "2026-01-30 12:15:00"
   */
  expiryDate?: string;
}

/** Response returned after creating a virtual account. */
export type CreateVirtualAccountResponse =
  ApiResponse<CreatedVirtualAccountData>;

/** Details used to create a virtual account for a sub account. */
export interface CreateSubVirtualAccountRequestBody {
  /**
   * Account reference.
   * Required string length: 16 - 64.
   */
  accountRef: string;

  /**
   * Account holder's name.
   * Required string length: 8 - 64.
   */
  accountName: string;

  /** Account holder's BVN. Optional. */
  bvn?: string;

  /**
   * Account holder's National Identification Number (NIN). Optional.
   * Must be exactly 11 digits.
   * Can be sent on its own or alongside bvn.
   * If neither is sent, the BVN on the parent business account is used.
   */
  nin?: string;

  /**
   * Amount the account can receive. Optional.
   */
  expectedAmount?: number;

  /**
   * Account expiry date. Optional.
   *
   * Example: "2026-01-30 12:15:00"
   */
  expiryDate?: string;
}

/** Response returned after creating a virtual account for a sub-account. */
export type CreateSubAccountVirtualAccountResponse =
  ApiResponse<CreatedVirtualAccountData>;

/** Response returned after suspending a virtual account. */
export type SuspendVirtualAccountResponse = ApiResponse<boolean>;

/** Response returned when looking up a virtual account. */
export type LookupVirtualAccountResponse =
  ApiResponse<VirtualAccountData>;

/** Data returned after expiring a virtual account. */
export interface ExpireVirtualAccountData {
  /** Successfully updated. */
  expired: boolean;
}

/** Response returned after expiring a virtual account. */
export type ExpireVirtualAccountResponse =
  ApiResponse<ExpireVirtualAccountData>;

/** Details used to filter virtual accounts. */
export interface ListVirtualAccountsRequestBody {
  /** Account holder's name. Required string length: 8 - 64. */
  accountName?: string;

  /** Account reference. Required string length: 16 - 64. */
  accountRef?: string;

  /** Bank Verification Number (BVN). Required string length: 11. */
  bvn?: string;

  /** Bank account number. */
  bankAccountNumber?: string;

  /** Date created from. */
  dateCreatedFrom?: string;

  /** Date created to. */
  dateCreatedTo?: string;

  /** Whether the virtual account is expired or not. */
  expired?: boolean;

  /** Whether the virtual account is in use or not. */
  resourceAcquired?: boolean;
}

/** Query parameters used when filtering virtual accounts. */
export interface ListVirtualAccountsQuery {
  /**
   * Describes the size of the page being queried.
   * This endpoint is paginated.
   */
  limit?: number;

  /**
   * Cursor used to scroll to the next page.
   * Omit this when making the first request.
   */
  cursor?: string;
}

/** Paginated virtual-account results. */
export interface ListVirtualAccountsData {
  /** Contains the list of virtual accounts. */
  results: VirtualAccountData[];

  /**
   * Cursor for pagination.
   * It will be empty if there is no more page to scroll to.
   */
  cursor?: string;
}

/** Response returned when filtering virtual accounts. */
export type ListVirtualAccountsResponse =
  ApiResponse<ListVirtualAccountsData>;

/** Response returned when fetching a virtual account. */
export type GetVirtualAccountResponse =
  ApiResponse<VirtualAccountData>;

/** Details used to update a virtual account. */
export interface UpdateVirtualAccountRequestBody {
  /**
   * The new account reference to issue to the virtual account.
   * This will be the value advised in the webhook post update.
   * Required string length: 8 - 64.
   */
  newAccountRef?: string;

  /**
   * Account holder's name you want to update to.
   * Required string length: 8 - 64.
   */
  accountName?: string;

  /**
   * If provided, the virtual account will only accept payments that
   * exactly match the specified amount.
   *
   * Once expectedAmount is set, the virtual account will no longer
   * accept arbitrary payment amounts. You can update the expectedAmount
   * value at any time to change the accepted amount.
   */
  expectedAmount?: string;
}

/** Data returned after updating a virtual account. */
export interface UpdateVirtualAccountData {
  /** Successfully updated. */
  updated: boolean;
}

/** Response returned after updating a virtual account. */
export type UpdateVirtualAccountResponse =
  ApiResponse<UpdateVirtualAccountData>;
