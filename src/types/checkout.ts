import { ApiResponse } from "./api-response.js";

/** Supported currencies. */
export type Currency = "NGN" | "CDF" | "USD" | string;

/** Supported payment methods for online checkout. */
export type CheckoutPaymentMethod =
  | "Card"
  | "Transfer"
  | "Nomba QR"
  | "USSD"
  | "Buy Now Pay Later"
  | "MOMO"
  | "Intl Card"
  | "Apple Pay"
  | "Intl Transfer";

/** Details used to split an online checkout payment. */
export interface CheckoutSplitRequest {
  // Add fields here once the splitRequest child attributes
  // are available from the Nomba documentation.
}

/** Request details for creating an online checkout order. */
export interface CreateCheckoutOrderRequestBody {
  /** The Checkout request object. */
  order: {
    /** Merchant callback url for redirect after payment. */
    callbackUrl: string;

    /** Customer email. */
    customerEmail: string;

    /** Amount to pay. */
    amount: number;

    /**
     * ISO 4217 currency code.
     * Use NGN for Nigerian checkout.
     * For DRC accounts, use CDF or USD — NGN is not supported for DRC
     * and will be rejected.
     */
    currency: Currency;

    /** Reference of the online checkout order to be created. */
    orderReference?: string;

    /** Customer ID. */
    customerId?: string;

    /** If specified, this is the account where the funds will be deposited. */
    accountId?: string;

    /**
     * Optional list of payment methods to display on the checkout page.
     * If not provided, all supported methods for your account and region
     * will be shown.
     *
     * Supported values:
     * Card, Transfer, Nomba QR, USSD, Buy Now Pay Later (Nigerian checkout);
     * MOMO, Intl Card, Apple Pay (DRC checkout);
     * Intl Transfer, which is Pay by Bank, for supported GBP and EUR
     * checkout flows.
     */
    allowedPaymentMethods?: CheckoutPaymentMethod[];

    /** Contains accounts where the inflow will be split into. */
    splitRequest?: CheckoutSplitRequest;

    /**
     * Arbitrary key-value metadata to attach to the order.
     * Keys and values must be strings.
     * Stored on the order and returned in webhook payloads.
     *
     * Special key: set "region" to "CD" to route this order through
     * DRC checkout (e.g. for a Nigerian merchant accepting DRC MoMo payments).
     */
    orderMetaData?: Record<string, string>;
  };

  /** Determines if the card used for payment is to be tokenized. */
  tokenizeCard?: boolean;
}

/** Data returned after creating an online checkout order. */
export interface CreateCheckoutOrderData {
  /** Payment checkout link. */
  checkoutLink: string;

  /** The reference of the order created. */
  orderReference: string;
}

/** Response returned after creating an online checkout order. */
export type CreateCheckoutOrderResponse =
  ApiResponse<CreateCheckoutOrderData>;


/** Details used to refund a checkout transaction. */
export interface RefundCheckoutTransactionRequestBody {
  /** The ID of the transaction to be refunded. */
  transactionId: string;

  /** The amount to be refunded. */
  amount?: number;

  /**
   * The account number for the refund.
   *
   * Required string length: 10.
   */
  accountNumber?: string;

  /** The bank code for the refund. */
  bankCode?: string;
}

/** Response data returned after refunding a checkout transaction. */
export interface RefundCheckoutTransactionData {
  /** Indicates whether the operation was successful. */
  success: boolean;

  /** A message describing the result of the operation. */
  message: string;
}

/** Response returned after refunding a checkout transaction. */
export type RefundCheckoutTransactionResponse =
  ApiResponse<RefundCheckoutTransactionData>;


/** Details used to cancel an incomplete or pending checkout order. */
export interface CancelCheckoutOrderRequestBody {
  /** The unique reference of the checkout order to cancel. */
  orderReference: string;
}

/** Response data returned after cancelling a checkout order. */
export interface CancelCheckoutOrderData {
  /** Indicates whether the cancellation was successful. */
  success: boolean;

  /** A message describing the result of the cancellation. */
  message: string;
}

/** Response returned after cancelling a checkout order. */
export type CancelCheckoutOrderResponse =
  ApiResponse<CancelCheckoutOrderData>;