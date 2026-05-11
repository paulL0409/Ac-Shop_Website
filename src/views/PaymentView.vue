<template>
  <div>
    <el-container class="page-container">
      <el-header class="app-header">
        <span>Payments</span>
        <div class="header-actions">
          <el-button class="header-btn" @click="handleReturn">Return</el-button>
          <el-button class="header-btn danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <div class="payment-wrapper">
          <div class="payment-card">
            <h2>Complete Your Payment</h2>
            <p class="subtitle">
              Enter your card details to pay for this order.
            </p>

            <div class="form-section">
              <label class="input-label">Card Details</label>
              <div id="card-element" class="stripe-input"></div>
            </div>

            <el-button
              type="primary"
              class="pay-btn"
              :loading="paying"
              @click="pay"
            >
              Pay Now
            </el-button>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import request from "@/utils/request";
import { loadStripe } from "@stripe/stripe-js";

export default {
  data() {
    return {
      tableData: [],
      formLabelWidth: "150px",
      clientSecret: null,
      stripe: null,
      elements: null,
      card: null,
    };
  },
  mounted() {
    this.initStripe();
  },
  methods: {
    async initStripe() {
      this.stripe = await loadStripe(
        "pk_test_51TAr7Y36qKNcT83oNQHu72B8I52vgBj7qKlnqSMHa5kYCUrhEw9gAl6JKT9EbkMAorefUuJq4UkGCZ9FHD8Myci900xxLXKSzh"
      );

      const res = await request.post("/payments/create", {
        orderId: this.$route.params.orderId,
      });

      this.clientSecret = res.data.data.clientSecret;

      this.mountCard();
    },

    mountCard() {
      this.elements = this.stripe.elements();

      this.card = this.elements.create("card");

      this.card.mount("#card-element");
    },

    async pay() {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        this.clientSecret,
        {
          payment_method: {
            card: this.card,
          },
        }
      );

      if (error) {
        this.$message.error(error.message);
      } else {
        if (paymentIntent.status === "succeeded") {
          this.$message.success("Payment successful");
          setTimeout(() => {
            this.$router.push("/orders");
          }, 1500);
        }
      }
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

.payment-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.payment-card {
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.payment-card h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
}

.subtitle {
  margin: 0 0 24px 0;
  color: #606266;
  font-size: 14px;
}

.form-section {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.stripe-input {
  padding: 14px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background: #fff;
  min-height: 20px;
}

.pay-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}
</style>