/**
 * PaymentService — contains a deliberately introduced race condition bug.
 *
 * BUG: processPayment() checks order status and then updates it in two separate
 * steps with no locking. Concurrent requests can both pass the status check
 * before either updates the status, resulting in double charges.
 */

export interface Order {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface PaymentResult {
  chargeId: string;
  amount: number;
  status: "success" | "failed";
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

export interface PaymentProvider {
  charge(params: { orderId: string; amount: number }): Promise<{ chargeId: string }>;
}

export class PaymentService {
  private orderRepo: OrderRepository;
  private paymentProvider: PaymentProvider;

  constructor(orderRepo: OrderRepository, paymentProvider: PaymentProvider) {
    this.orderRepo = orderRepo;
    this.paymentProvider = paymentProvider;
  }

  /**
   * BUG: race condition here.
   * Two concurrent calls can both read status='pending',
   * both pass the check, and both proceed to charge.
   */
  async processPayment(orderId: string): Promise<PaymentResult> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // BUG: check-then-act without a lock — vulnerable to race condition
    if (order.status !== "pending") {
      throw new Error(`Order ${orderId} already processed`);
    }

    // Simulate async gap (allows concurrent requests to both pass the check)
    await new Promise((resolve) => setTimeout(resolve, 10));

    // BUG: both concurrent requests reach this line
    order.status = "processing";
    await this.orderRepo.save(order);

    const charge = await this.paymentProvider.charge({
      orderId: order.id,
      amount: order.amount,
    });

    order.status = "completed";
    await this.orderRepo.save(order);

    return {
      chargeId: charge.chargeId,
      amount: order.amount,
      status: "success",
    };
  }
}
