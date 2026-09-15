import { ApiResponse } from "./api-response.js";

/** Details of a supported Nigerian bank. */
export interface BankData {
  /**
   * The bank's code.
   *
   * Required string length: 3 - 6.
   * Use this value as bankCode in transfer and account lookup requests.
   */
  code: string;

  /** The bank's name. */
  name: string;

  /** The bank's NIP institution code. May be null. */
  nipCode: string | null;

  /**
   * URL of the bank's logo image.
   *
   * An empty string when no logo is available.
   */
  logo: string;
}

/** Response returned when fetching supported Nigerian banks. */
export type ListBanksResponse = ApiResponse<BankData[]>;

/** Details used to perform a bank account lookup. */
export interface BankAccountLookupRequestBody {
  /**
   * The account number to be looked up.
   *
   * Required string length: 10.
   */
  accountNumber: string;

  /**
   * The bankCode of the bank the account number belongs to.
   *
   * This can be obtained from a call to /v1/transfers/banks.
   */
  bankCode: string;
}

/** Bank account details returned after a successful lookup. */
export interface BankAccountLookupData {
  /**
   * The account number that was looked up.
   *
   * Required string length: 10.
   */
  accountNumber: string;

  /** The name on the account. */
  accountName: string;
}

/** Response returned after performing a bank account lookup. */
export type BankAccountLookupResponse =
  ApiResponse<BankAccountLookupData>;


/** Supported response descriptions for a bank transfer. */
export type BankTransferResponseDescription =
  | "SUCCESS"
  | "PROCESSING"
  | "FAILED"
  | "BAD_REQUEST"
  | "INSUFFICIENT_BALANCE"
  | "ACCOUNT_NOT_FOUND"
  | "INVALID_TRANSACTION"
  | "WALLET_NOT_FOUND"
  | "BLACKLISTED";

/** Supported transaction types returned for a bank transfer. */
export type BankTransferTransactionType =
  | "withdrawal"
  | "purchase"
  | "transfer"
  | "p2p"
  | "online_checkout"
  | "qrt_credit"
  | "qrt_debit";

/**
 * Supported statuses for a bank transfer.
 *
 * The initial response can be SUCCESS or PENDING_BILLING.
 * On failure, the transfer may eventually become REFUND.
 */
export type BankTransferStatus =
  | "SUCCESS"
  | "PENDING_BILLING"
  | "REFUND";

/** Details used to perform a bank account transfer. */
export interface BankTransferRequestBody {
  /** The amount to be transferred. */
  amount: number;

  /**
   * The destination bank account number.
   *
   * Required string length: 10.
   */
  accountNumber: string;

  /** The name on the account. */
  accountName: string;

  /** The code of the recipient bank. */
  bankCode: string;

  /**
   * Unique reference used to track a transaction from an external process.
   *
   * This is an idempotency key and must be unique per transaction.
   */
  merchantTxRef: string;

  /** Sender name. */
  senderName?: string;

  /** The payment narration. */
  narration?: string;
}

/** Transaction metadata returned with a bank transfer. */
export interface BankTransferMeta {
  [key: string]: unknown;
}

/** Data returned after initiating a bank transfer. */
export interface BankTransferData {
  /** Amount to be transferred. */
  amount: string;

  /** Transaction meta data. */
  meta: BankTransferMeta;

  /** Transfer fee. */
  fee: number;

  /** Creation timestamp. */
  timeCreated: string;

  /** Transfer ID. */
  id: string;

  /** Transaction type. */
  type: BankTransferTransactionType;

  /**
   * Transaction status.
   *
   * The initial response can be SUCCESS or PENDING_BILLING.
   */
  status: BankTransferStatus;

  /** Transfer source, such as web or API. */
  source?: string;

  /** Source user ID. */
  sourceUserId?: string;

  /** Customer biller ID. */
  customerBillerId?: string;

  /** A unique number for the product. */
  productId?: string;

  /** Returned response message. */
  message?: string;
}

/**
 * Response returned after initiating a bank transfer.
 *
 * Listen for webhook notifications for the final transfer status,
 * or poll using the returned transfer ID.
 */
export type BankTransferResponse =
  ApiResponse<BankTransferData>;
