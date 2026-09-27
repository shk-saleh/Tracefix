# Demo Payment Service

A Node.js/TypeScript service with a **deliberately introduced race condition bug** for testing TRACEFIX.

## The Bug

`PaymentService.processPayment()` contains a classic check-then-act race condition.
Two concurrent requests for the same order can both pass the status check before
either updates the order, resulting in a double charge.

```typescript
// BUG: check-then-act without a lock
if (order.status !== "pending") {
  throw new Error(`Order already processed`);
}
// gap — concurrent request can also pass here
await new Promise((resolve) => setTimeout(resolve, 10));
order.status = "processing";
```

## Expected Test Behavior

| Test | Before Fix | After Fix |
|------|-----------|-----------|
| processes a valid payment | ✅ PASS | ✅ PASS |
| throws for non-existent order | ✅ PASS | ✅ PASS |
| throws when already processed | ✅ PASS | ✅ PASS |
| prevents double-charge (race condition) | ❌ FAIL | ✅ PASS |

## Running Tests

```bash
npm install
npm test
```

## Using with TRACEFIX

1. Push this repository to GitHub
2. Open TRACEFIX → select this repository
3. Enter bug description: *"Users are occasionally charged twice when clicking Pay twice quickly"*
4. Start Investigation
5. TRACEFIX will clone, detect Jest, run baseline tests (1 failing), investigate, and generate a fix
