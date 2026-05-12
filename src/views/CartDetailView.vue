<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="navbar-left">
        <img src="@/assets/image/ac-shop-logo.png" class="nav-logo" alt="AC Shop" />
      </div>
      <div class="navbar-right">
        <button class="btn-back" @click="handleReturn">← Continue Shopping</button>
        <button class="btn-logout" @click="handleLogout">Sign Out</button>
      </div>
    </header>

    <!-- Content -->
    <div class="content">
      <div class="page-heading">
        <p class="section-label">Your Cart</p>
        <h1 class="section-title">Shopping Cart</h1>
        <p class="section-desc">Review your items and proceed to checkout when ready.</p>
      </div>

      <!-- Empty cart -->
      <div v-if="tableData.length === 0" class="empty-state">
        <p class="empty-icon">🛍️</p>
        <p class="empty-title">Your cart is empty</p>
        <p class="empty-desc">Browse our shops and add some products to get started.</p>
        <button class="btn-shop" @click="handleReturn">Browse Shops</button>
      </div>

      <!-- Cart layout -->
      <div v-else class="cart-layout">
        <!-- Items list -->
        <div class="cart-items">
          <div v-for="item in tableData" :key="item.id" class="cart-item">
            <div class="item-img">
              <img v-if="item.imageUrl" :src="item.imageUrl" alt="product" />
              <div v-else class="img-placeholder">📦</div>
            </div>
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-unit">${{ Number(item.price).toFixed(2) }} per item</p>
            </div>
            <div class="item-qty">
              <button class="qty-btn" @click="dec(item)" title="Decrease">−</button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button class="qty-btn" @click="inc(item)" title="Increase">+</button>
            </div>
            <div class="item-subtotal">${{ Number(item.totalPrice).toFixed(2) }}</div>
            <button class="remove-btn" @click="remove(item)" title="Remove item">✕</button>
          </div>
        </div>

        <!-- Order summary -->
        <div class="summary-panel">
          <h3 class="summary-title">Order Summary</h3>
          <div class="summary-row">
            <span>Items ({{ tableData.length }})</span>
            <span>${{ cartTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span class="free-tag">Free</span>
          </div>
          <div class="summary-divider" />
          <div class="summary-total">
            <span>Total</span>
            <span class="total-amount">${{ cartTotal.toFixed(2) }}</span>
          </div>
          <button class="btn-checkout" @click="checkout">
            Proceed to Checkout
          </button>
          <p class="checkout-note">Secure checkout powered by Stripe</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  data() {
    return { tableData: [] };
  },
  mounted() {
    this.loadData();
  },
  computed: {
    cartTotal() {
      return this.tableData.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    },
  },
  methods: {
    loadData() {
      request.get("/carts").then((response) => {
        this.tableData = response.data.data;
      });
    },
    inc(row) { request.put(`/carts/${row.id}/increase`).then(() => this.loadData()); },
    dec(row) { request.put(`/carts/${row.id}/decrease`).then(() => this.loadData()); },
    remove(row) {
      this.$confirm(`Remove "${row.name}" from your cart?`, "Remove Item", {
        confirmButtonText: "Remove", cancelButtonText: "Cancel", type: "warning",
      }).then(() => {
        request.delete(`/carts/${row.id}`).then(() => this.loadData());
      }).catch(() => {});
    },
    handleReturn() { this.$router.back(); },
    handleLogout() {
      this.$confirm("Are you sure you want to sign out?", "Sign Out", {
        confirmButtonText: "Sign Out", cancelButtonText: "Cancel", type: "warning",
      }).then(() => {
        localStorage.removeItem("token");
        this.$router.push("/login");
      }).catch(() => {});
    },
    checkout() {
      request.post("/orders/checkout").then((response) => {
        const orderId = response.data.data;
        this.$message.success("Order placed — redirecting to payment...");
        this.$router.push(`/payment/${orderId}`);
      });
    },
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8fafc;
}

/* ── Navbar ── */
.navbar {
  height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
}

.navbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  background: #ffffff;
  color: #0f172a;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-back:hover { background: #f8fafc; }

.btn-logout {
  padding: 8px 20px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-logout:hover { background: #1e293b; }

/* ── Content ── */
.content {
  padding: 40px 32px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-heading {
  margin-bottom: 32px;
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.section-title {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 6px;
  letter-spacing: -1px;
}

.section-desc {
  font-size: 15px;
  color: #64748b;
}

/* ── Empty state ── */
.empty-state {
  background: #ffffff;
  border-radius: 20px;
  padding: 80px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.empty-icon { font-size: 52px; }
.empty-title { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; }
.empty-desc { font-size: 14px; color: #64748b; margin-bottom: 8px; }

.btn-shop {
  padding: 12px 28px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  margin-top: 8px;
  transition: background 0.15s;
}

.btn-shop:hover { background: #1e293b; }

/* ── Cart layout ── */
.cart-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* ── Cart items ── */
.cart-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  transition: box-shadow 0.15s;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.item-img {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: #f1f5f9;
  flex-shrink: 0;
}

.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #cbd5e1;
}

.item-info { flex: 1; }

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 3px;
  letter-spacing: -0.2px;
}

.item-unit {
  font-size: 13px;
  color: #94a3b8;
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  transition: background 0.15s, border-color 0.15s;
}

.qty-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.qty-num {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  min-width: 24px;
  text-align: center;
}

.item-subtotal {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  min-width: 80px;
  text-align: right;
  letter-spacing: -0.3px;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.remove-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ── Summary panel ── */
.summary-panel {
  width: 320px;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
  position: sticky;
  top: 80px;
  flex-shrink: 0;
}

.summary-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
  letter-spacing: -0.3px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 10px;
}

.free-tag {
  color: #10b981;
  font-weight: 700;
}

.summary-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 16px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 24px;
}

.total-amount {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.02em;
  transition: background 0.15s, transform 0.1s;
  margin-bottom: 12px;
}

.btn-checkout:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.checkout-note {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}
</style>
