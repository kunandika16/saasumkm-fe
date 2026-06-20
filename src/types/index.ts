// ─── Enums ───────────────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum PaymentMethod {
  CASH = "cash",
  QRIS = "qris",
}

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export enum PointTransactionType {
  EARNED = "earned",
  REDEEMED = "redeemed",
  EXPIRED = "expired",
}

// ─── Models ──────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  locationMapUrl: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: string;
}

export interface Admin {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface TenantSettings {
  id: string;
  tenantId: string;
  pointsPerAmount: number;
  amountPerPoint: number;
  pointExpiryDays: number;
  googlePlaceUrl: string | null;
  reviewRewardType: string | null;
  reviewRewardValue: number | null;
  welcomeVoucherType: string | null;
  welcomeVoucherValue: number | null;
  welcomeVoucherDays: number | null;
  updatedAt: string;
}

export interface Member {
  id: string;
  tenantId: string;
  name: string;
  whatsapp: string;
  pointBalance: number;
  totalVisits: number;
  registeredAt: string;
  lastVisitAt: string | null;
}

export interface Visit {
  id: string;
  memberId: string;
  accessMethod: string;
  visitedAt: string;
}

export interface MenuCategory {
  id: string;
  tenantId: string;
  name: string;
  sortOrder: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Order {
  id: string;
  memberId: string;
  tenantId: string;
  voucherId: string | null;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentBarcode: string | null;
  pointsEarned: number;
  createdAt: string;
  validatedAt: string | null;
  expiredAt: string | null;
  items?: OrderItem[];
  member?: Member;
  voucher?: Voucher;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface Voucher {
  id: string;
  tenantId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;
  maxUsage: number;
  currentUsage: number;
  isActive: boolean;
  isWelcomeVoucher: boolean;
  issuedToMemberId: string | null;
  createdAt: string;
}

export interface VoucherUsage {
  id: string;
  voucherId: string;
  memberId: string;
  orderId: string;
  usedAt: string;
}

export interface Reward {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  requiredPoints: number;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string | null;
  menuItemId: string | null;
  discountType: 'free' | 'discount';
  discountSubType: 'fixed' | 'percentage' | null;
  discountValue: number | null;
  createdAt: string;
  menuItem?: MenuItem;
  redemptionCount?: number;
}

export interface RewardVoucher {
  id: string;
  tenantId: string;
  memberId: string;
  rewardId: string;
  menuItemId: string;
  code: string;
  discountType: 'free' | 'discount';
  discountSubType: 'fixed' | 'percentage' | null;
  discountValue: number | null;
  expiryDate: string;
  isUsed: boolean;
  usedAt: string | null;
  orderId: string | null;
  createdAt: string;
  reward?: Reward;
  menuItem?: MenuItem;
}

export interface PointTransaction {
  id: string;
  memberId: string;
  type: PointTransactionType;
  amount: number;
  orderId: string | null;
  rewardId: string | null;
  resultingBalance: number;
  createdAt: string;
}

export interface ReviewClick {
  id: string;
  memberId: string;
  tenantId: string;
  rewardGranted: boolean;
  clickedAt: string;
}

// ─── API Request/Response Types ──────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  whatsapp: string;
  tenantId: string;
}

export interface LoginRequest {
  whatsapp: string;
  tenantId: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  member?: Member;
  admin?: Admin;
  welcomeVoucher?: Voucher;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CheckoutRequest {
  items: CartItemRequest[];
  voucherCode?: string;
  rewardVoucherCode?: string;
  paymentMethod: "cash" | "qris";
}

export interface CartItemRequest {
  menuItemId: string;
  quantity: number;
}

export interface ValidateVoucherRequest {
  code: string;
  cartTotal: number;
}

export interface ValidateVoucherResponse {
  valid: boolean;
  voucher?: Voucher;
  discountAmount?: number;
  reason?: string;
}

export interface OrderValidationRequest {
  action: "confirm" | "reject";
}

export interface ProfileUpdateRequest {
  name: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  totalMembers: number;
  totalVisitsThisMonth: number;
  repeatCustomerCount: number;
  topMembersByVisits: TopMember[];
  totalVouchersRedeemedThisMonth: number;
  totalOrdersThisMonth: number;
  totalRevenueThisMonth: number;
}

export interface TopMember {
  id: string;
  name: string;
  visitCount: number;
}

export interface DailyVisitor {
  date: string;
  uniqueVisitors: number;
}

export interface MenuPopularity {
  menuItemId: string;
  name: string;
  orderCount: number;
}

// ─── Cart Types (Frontend State) ─────────────────────────────────────────────

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
