/**
 * Tests for PaymentService.
 *
 * NOTE: The concurrency test intentionally FAILS with the current buggy implementation.
 * After the fix is applied, all tests should pass.
 */
import { PaymentService, Order, OrderRepository, PaymentProvider } from "../src/payment";

// ── Mock implementations ──────────────────────────────────────────────────────

class MockOrderRepo implements OrderRepository {
  private orders: Map<string, Order> = new Map();

  seed(order: Order) {
    this.orders.set(order.id, { ...order });
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    return order ? { ...order } : null;
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, { ...order });
  }
}

let chargeCounter = 0;

class MockPaymentProvider implements PaymentProvider {
  async charge(params: { orderId: string; amount: number }): Promise<{ chargeId: string }> {
    chargeCounter++;
    return { chargeId: `ch_${params.orderId}_${chargeCounter}` };
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("PaymentService", () => {
  let repo: MockOrderRepo;
  let provider: MockPaymentProvider;
  let service: PaymentService;

  beforeEach(() => {
    chargeCounter = 0;
    repo = new MockOrderRepo();
    provider = new MockPaymentProvider();
    service = new PaymentService(repo, provider);
  });

  describe("processPayment", () => {
    it("processes a valid payment successfully", async () => {
      repo.seed({ id: "order-001", amount: 9999, status: "pending" });

      const result = await service.processPayment("order-001");

      expect(result.status).toBe("success");
      expect(result.amount).toBe(9999);
      expect(result.chargeId).toBeTruthy();
    });

    it("throws for non-existent order", async () => {
      await expect(service.processPayment("order-999")).rejects.toThrow(
        "Order order-999 not found"
      );
    });

    it("throws when order is already processed", async () => {
      repo.seed({ id: "order-002", amount: 500, status: "completed" });

      await expect(service.processPayment("order-002")).rejects.toThrow(
        "already processed"
      );
    });

    /**
     * This test FAILS with the current buggy code.
     * It should PASS after the fix is applied.
     *
     * The bug: concurrent calls both pass the status check before
     * either updates the order, resulting in two charges.
     */
    it("prevents double-charge on concurrent payment requests (RACE CONDITION)", async () => {
      repo.seed({ id: "order-race", amount: 2999, status: "pending" });

      // Fire two concurrent payment requests for the same order
      const [result1, result2] = await Promise.allSettled([
        service.processPayment("order-race"),
        service.processPayment("order-race"),
      ]);

      const fulfilled = [result1, result2].filter((r) => r.status === "fulfilled");
      const rejected = [result1, result2].filter((r) => r.status === "rejected");

      // Exactly one request should succeed, the other should be rejected
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      // The payment provider should have been called exactly once
      expect(chargeCounter).toBe(1);
    });
  });
});
