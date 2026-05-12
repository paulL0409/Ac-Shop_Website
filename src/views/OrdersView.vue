<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="navbar-left">
        <img src="@/assets/image/ac-shop-logo.png" class="nav-logo" alt="AC Shop" />
      </div>
      <div class="navbar-right">
        <button class="btn-back" @click="handleReturn">← Back to Shopping</button>
        <button class="btn-logout" @click="handleLogout">Sign Out</button>
      </div>
    </header>

    <!-- Content -->
    <div class="content">
      <div class="page-heading">
        <p class="section-label">Account</p>
        <h1 class="section-title">Order History</h1>
        <p class="section-desc">Track and review all your past orders.</p>
      </div>

      <div v-if="tableData.length === 0" class="empty-state">
        <p class="empty-icon">📋</p>
        <p class="empty-title">No orders yet</p>
        <p class="empty-desc">Once you place an order, it will appear here.</p>
        <button class="btn-shop" @click="handleReturn">Start Shopping</button>
      </div>

      <div v-else class="orders-card">
        <div class="orders-header-row">
          <span>Order ID</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        <div v-for="order in tableData" :key="order.id" class="order-row">
          <div class="order-id">#{{ order.id }}</div>
          <div class="order-date">{{ formatDate(order.createTime) }}</div>
          <div class="order-amount">${{ Number(order.totalAmount).toFixed(2) }}</div>
          <div class="order-status">
            <span :class="['status-badge', statusClass(order.status)]">
              {{ statusLabel(order.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";

export default {
  data() {
    return {
      tableData: [],
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      request.get("/orders").then((response) => {
        this.tableData = response.data.data;
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-AU', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    },
    statusLabel(status) {
      const map = { PAID: 'Paid', PENDING: 'Pending', CANCELLED: 'Cancelled' };
      return map[status] || status;
    },
    statusClass(status) {
      const map = { PAID: 'status-paid', PENDING: 'status-pending', CANCELLED: 'status-cancelled' };
      return map[status] || 'status-default';
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

.navbar-left { display: flex; align-items: center; gap: 12px; }

.nav-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
}

.navbar-right { display: flex; gap: 10px; align-items: center; }

.btn-back {
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
  max-width: 900px;
  margin: 0 auto;
}

.page-heading { margin-bottom: 32px; }

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

.section-desc { font-size: 15px; color: #64748b; }

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

/* ── Orders card ── */
.orders-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.orders-header-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr;
  padding: 14px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.order-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr;
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background 0.15s;
}

.order-row:last-child { border-bottom: none; }
.order-row:hover { background: #fafafa; }

.order-id {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Courier New', monospace;
}

.order-date {
  font-size: 14px;
  color: #64748b;
}

.order-amount {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.status-paid { background: #dcfce7; color: #15803d; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-cancelled { background: #fee2e2; color: #b91c1c; }
.status-default { background: #f1f5f9; color: #64748b; }
</style>
