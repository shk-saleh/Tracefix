import { NextRequest, NextResponse } from "next/server";
import { type InvestigationStatus } from "@/types/investigation";

// ---------------------------------------------------------------------------
// Fixture: a completed investigation of a race condition in PaymentService.ts
// This data drives every component in the dashboard without a real backend.
// ---------------------------------------------------------------------------

const FIXTURE: InvestigationStatus = {
  investigationId: "demo-001",
  phase: "completed",

  // ── Timeline ──────────────────────────────────────────────────────────────
  timeline: [
    {
      id: "t1",
      label: "Repository cloned",
      status: "completed",
      timestamp: new Date(Date.now() - 180_000).toISOString(),
    },
    {
      id: "t2",
      label: "Indexed 247 files",
      status: "completed",
      timestamp: new Date(Date.now() - 165_000).toISOString(),
    },
    {
      id: "t3",
      label: "Payment flow discovered",
      status: "completed",
      timestamp: new Date(Date.now() - 150_000).toISOString(),
    },
    {
      id: "t4",
      label: "Git history analyzed",
      status: "completed",
      timestamp: new Date(Date.now() - 130_000).toISOString(),
    },
    {
      id: "t5",
      label: "Reproduction case generated",
      status: "completed",
      timestamp: new Date(Date.now() - 110_000).toISOString(),
    },
    {
      id: "t6",
      label: "Bug reproduced",
      status: "completed",
      timestamp: new Date(Date.now() - 90_000).toISOString(),
    },
    {
      id: "t7",
      label: "Root cause established",
      status: "completed",
      timestamp: new Date(Date.now() - 70_000).toISOString(),
    },
    {
      id: "t8",
      label: "Patch generated",
      status: "completed",
      timestamp: new Date(Date.now() - 50_000).toISOString(),
    },
    {
      id: "t9",
      label: "Regression test written",
      status: "completed",
      timestamp: new Date(Date.now() - 30_000).toISOString(),
    },
    {
      id: "t10",
      label: "Verification complete",
      status: "completed",
      timestamp: new Date(Date.now() - 10_000).toISOString(),
    },
  ],

  // ── Agents ────────────────────────────────────────────────────────────────
  agents: [
    {
      id: "a1",
      name: "Code Agent",
      status: "completed",
      currentTask: "Analyzed PaymentService.ts",
      progress: 100,
      result: "Found race condition in processPayment() at line 84",
    },
    {
      id: "a2",
      name: "History Agent",
      status: "completed",
      currentTask: "Scanned commit history",
      progress: 100,
      result: "Found 3 related commits introducing the issue",
    },
    {
      id: "a3",
      name: "Testing Agent",
      status: "completed",
      currentTask: "Generated regression test",
      progress: 100,
      result: "payment.race.test.ts — 1 test, PASS",
    },
  ],

  // ── Root Cause ────────────────────────────────────────────────────────────
  rootCause: {
    file: "src/services/PaymentService.ts",
    line: 84,
    issue: "Race Condition — concurrent processPayment() calls share mutable state without locking",
    confidence: 93,
    evidenceIds: ["e1", "e2", "e3", "e4", "e5"],
  },

  // ── Code Diff ─────────────────────────────────────────────────────────────
  diff: `--- a/src/services/PaymentService.ts
+++ b/src/services/PaymentService.ts
@@ -81,12 +81,15 @@ export class PaymentService {
   async processPayment(orderId: string, amount: number): Promise<PaymentResult> {
     const order = await this.orderRepo.findById(orderId);
 
-    // BUG: no lock — concurrent calls can double-charge
-    if (order.status !== 'pending') {
-      throw new Error('Order already processed');
-    }
-    order.status = 'processing';
-    await this.orderRepo.save(order);
+    // FIX: acquire distributed lock before mutating order status
+    const lock = await this.lockService.acquire(\`order:\${orderId}\`, 5000);
+    try {
+      if (order.status !== 'pending') {
+        throw new Error('Order already processed');
+      }
+      order.status = 'processing';
+      await this.orderRepo.save(order);
+    } finally {
+      await lock.release();
+    }
 
     const charge = await this.stripeClient.charge({
       amount,`,

  // ── Regression Test ───────────────────────────────────────────────────────
  regressionTest: {
    testName: "PaymentService › processPayment › prevents race condition on concurrent calls",
    status: "pass",
    source: `import { PaymentService } from '../src/services/PaymentService';
import { MockOrderRepo } from './mocks/MockOrderRepo';
import { MockLockService } from './mocks/MockLockService';
import { MockStripeClient } from './mocks/MockStripeClient';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService(
      new MockOrderRepo(),
      new MockLockService(),
      new MockStripeClient(),
    );
  });

  describe('processPayment', () => {
    it('prevents race condition on concurrent calls', async () => {
      // Arrange — two concurrent calls for the same order
      const orderId = 'order-123';
      const amount = 99_99;

      // Act — fire both simultaneously
      const [result1, result2] = await Promise.allSettled([
        service.processPayment(orderId, amount),
        service.processPayment(orderId, amount),
      ]);

      // Assert — exactly one succeeds, the other throws
      const fulfilled = [result1, result2].filter(r => r.status === 'fulfilled');
      const rejected  = [result1, result2].filter(r => r.status === 'rejected');

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect((rejected[0] as PromiseRejectedResult).reason.message)
        .toBe('Order already processed');
    });
  });
});`,
  },

  // ── Verification ──────────────────────────────────────────────────────────
  verification: {
    bugReproduced:       true,
    rootCauseVerified:   true,
    regressionGenerated: true,
    existingTestsPassed: true,
    newTestsPassed:      true,
    impactAnalyzed:      true,
    overallStatus:       "verified",
  },

  // ── Evidence ──────────────────────────────────────────────────────────────
  evidence: [
    {
      id: "e1",
      type: "stack_trace",
      title: "Double-charge stack trace",
      content: `Error: Duplicate charge detected for order-982
  at PaymentService.processPayment (PaymentService.ts:84:11)
  at async OrderController.checkout (OrderController.ts:52:5)
  at async Layer.handle [as handle_request] (express/router/layer.js:95:5)

Charge #1: ch_3Nk8QX2eZvKYlo2C0hJ7pMxR — $999.00 — 2024-01-15T14:32:01Z
Charge #2: ch_3Nk8QX2eZvKYlo2C0hJ7pMxS — $999.00 — 2024-01-15T14:32:01Z (DUPLICATE)`,
    },
    {
      id: "e2",
      type: "git_commit",
      title: "Commit introducing the bug — a3f9c12",
      content: `commit a3f9c12d8e4b7f2a1c9e5d3b6a8f0e2d4c7b9a1
Author: Jane Smith <jane@acme.com>
Date:   Mon Jan 8 16:44:02 2024 +0000

    feat: add concurrent payment processing for performance

    Removed sequential lock to improve throughput under load.
    NOTE: Did not account for race condition in order status check.

diff --git a/src/services/PaymentService.ts b/src/services/PaymentService.ts
-    const lock = await this.lockService.acquire(\`order:\${orderId}\`);
-    try {
       const order = await this.orderRepo.findById(orderId);
       if (order.status !== 'pending') {
-    } finally {
-      await lock.release();
-    }`,
    },
    {
      id: "e3",
      type: "related_file",
      title: "OrderController.ts — affected call site",
      content: `// src/controllers/OrderController.ts (line 48–58)
async checkout(req: Request, res: Response) {
  const { orderId, paymentMethod } = req.body;

  // BUG: both requests reach processPayment concurrently
  // before the first one updates order.status to 'processing'
  const result = await this.paymentService.processPayment(
    orderId,
    req.body.amount
  );

  res.json({ success: true, chargeId: result.chargeId });
}`,
    },
    {
      id: "e4",
      type: "missing_test",
      title: "No concurrency test existed before this fix",
      content: `// Search result: 0 files matched pattern "concurrent" OR "race" in test/
// Nearest existing test:

it('processes a valid payment', async () => {
  const result = await service.processPayment('order-001', 5000);
  expect(result.status).toBe('success');
});

// Gap: single-threaded test — never exercises the concurrent path.
// Regression test added: payment.race.test.ts`,
    },
    {
      id: "e5",
      type: "execution_trace",
      title: "Concurrent execution trace showing the window",
      content: `T=0ms   Thread A: findById('order-982') → { status: 'pending' }  ✓
T=0ms   Thread B: findById('order-982') → { status: 'pending' }  ✓
T=1ms   Thread A: status check → 'pending' → PASS
T=1ms   Thread B: status check → 'pending' → PASS  ← both pass!
T=2ms   Thread A: order.status = 'processing' → save()
T=2ms   Thread B: order.status = 'processing' → save()
T=3ms   Thread A: stripe.charge($999) → ch_...pMxR  ✓
T=3ms   Thread B: stripe.charge($999) → ch_...pMxS  ← DUPLICATE CHARGE`,
    },
  ],

  // ── Metadata ──────────────────────────────────────────────────────────────
  metadata: {
    affectedFiles: [
      "src/services/PaymentService.ts",
      "src/controllers/OrderController.ts",
      "src/services/LockService.ts",
    ],
    relatedCommits: [
      { hash: "a3f9c12d", message: "feat: add concurrent payment processing" },
      { hash: "b7e2f45a", message: "refactor: extract payment logic to service" },
      { hash: "c1d8a93e", message: "fix: add order status validation" },
    ],
    confidence: 93,
    riskLevel: "medium",
    executionTimeMs: 172_400,
    estimatedTimeSavedHrs: 4.2,
  },

  // ── Repo ──────────────────────────────────────────────────────────────────
  repo: {
    name: "acme-corp/payment-service",
    url: "https://github.com/acme-corp/payment-service",
    language: "TypeScript",
    branch: "main",
    fileCount: 247,
    testCount: 84,
    status: "connected",
  },
};

// ---------------------------------------------------------------------------
// GET /api/investigate/status?id=<investigationId>
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing required query param: id" },
      { status: 400 }
    );
  }

  // In production: look up real investigation state by ID.
  // For the MVP demo: return the fixture for any ID.
  return NextResponse.json(FIXTURE);
}
