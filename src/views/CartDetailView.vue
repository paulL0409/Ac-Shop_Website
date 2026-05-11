<template>
  <div>
    <el-container class="page-container">
      <el-header class="app-header">
        <span>Cart</span>
        <div class="header-actions">
          <el-button class="header-btn" @click="handleReturn">Return</el-button>
          <el-button class="header-btn danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-container>
        <el-main class="main-content">
          <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="name" label="Name" width="180" />
            <el-table-column label="Image" width="100">
              <template #default="scope">
                <img
                  v-if="scope.row.imageUrl"
                  :src="scope.row.imageUrl"
                  class="table-img"
                  alt="item"
                />
                <img v-else src="https://placehold.co/60x60/e2e8f0/94a3b8?text=No+Image" class="table-img" alt="no image" />
              </template>
            </el-table-column>
            <el-table-column prop="price" label="Price" width="120" />
            <el-table-column prop="quantity" label="Qty" width="80" />
            <el-table-column prop="totalPrice" label="Subtotal" width="120" />
            <el-table-column label="Operation" width="180">
              <template #default="scope">
                <el-button size="small" type="success" @click="inc(scope.row)">+</el-button>
                <el-button size="small" @click="dec(scope.row)">-</el-button>
                <el-button size="small" type="danger" @click="remove(scope.row)">Remove</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="checkout-panel">
            <div class="checkout-total">Total: <strong>${{ cartTotal.toFixed(2) }}</strong></div>
            <el-button type="success" size="large" class="checkout-btn" @click="checkout">
              Checkout
            </el-button>
          </div>
        </el-main>
      </el-container>
    </el-container>
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
      request.get("/carts").then((response) => {
        this.tableData = response.data.data;
      });
    },
    inc(row) {
      request.put(`/carts/${row.id}/increase`).then(() => this.loadData());
    },
    dec(row) {
      request.put(`/carts/${row.id}/decrease`).then(() => this.loadData());
    },
    remove(row) {
      request.delete(`/carts/${row.id}`).then(() => this.loadData());
    },
    handleReturn() {
      this.$router.back();
    },
    handleLogout() {
      this.$confirm("Are you sure you want to logout?", "Logout", {
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          localStorage.removeItem("token");
          this.$router.push("/login");
        })
        .catch(() => {});
    },
    checkout() {
      request.post("/orders/checkout").then((response) => {
        const orderId = response.data.data;
        this.$message.success("Order placed successfully");
        this.$router.push(`/payment/${orderId}`);
      });
    },
  },
  computed: {
    cartTotal() {
      return this.tableData.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0),
        0
      );
    },
  },
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px !important;
  padding: 0 24px;
  background-color: #1e293b;
  color: #ffffff;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-btn {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff;
}

.header-btn.danger {
  border-color: rgba(239, 68, 68, 0.6);
  color: #fca5a5;
}

.header-btn.danger:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #f87171;
  color: #fca5a5;
}

.main-content {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--color-bg-page);
}

.table-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.no-img {
  color: #94a3b8;
}

.checkout-panel {
  position: fixed;
  right: 32px;
  bottom: 32px;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.checkout-total {
  font-size: 16px;
  color: #1e293b;
}

.checkout-total strong {
  font-size: 20px;
  color: #16a34a;
}

.checkout-btn {
  width: 100%;
  font-weight: 600;
}
</style>
