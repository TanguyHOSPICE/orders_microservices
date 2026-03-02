export enum EnumOrdersStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
}

export enum EnumPaymentsStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
export enum EnumCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  ZH = 'ZH',
}
export enum EnumRole {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',

  USER = 'USER',
}

export enum EnumAddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
  HOME = 'home',
  WORK = 'work',
  PICKUP = 'pickup',
  OTHER = 'other',
  // DEFAULT = 'default',
  RETURN = 'return',
}
export enum EnumAddressStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}
