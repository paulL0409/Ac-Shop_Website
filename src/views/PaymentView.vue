<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="navbar-left">
        <img src="@/assets/image/ac-shop-logo.png" class="nav-logo" alt="AC Shop" />
      </div>
      <div class="navbar-right">
        <button class="btn-back" @click="handleReturn">← Back</button>
        <button class="btn-logout" @click="handleLogout">Sign Out</button>
      </div>
    </header>

    <!-- Content -->
    <div class="content">
      <div class="payment-wrapper">
        <!-- Left: info -->
        <div class="payment-info">
          <p class="section-label">Secure Checkout</p>
          <h1 class="section-title">Complete Your Payment</h1>
          <p class="section-desc">Your order has been placed. Enter your card details below to confirm payment.</p>

        </div>

        <!-- Right: payment card -->
        <div class="payment-card">
          <h2 class="card-title">Card Details</h2>
          <p class="card-subtitle">All transactions are secure and encrypted.</p>

          <div class="stripe-field-wrap">
            <label class="field-label">Credit or Debit Card</label>
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

          <p class="pay-note">By completing this payment you agree to our terms of service.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";
import { loadStripe } from "@stripe/stripe-js";

export default {
  data() {
    return {
      clientSecret: null,
      stripe: null,
      elements: null,
      card: null,
      paying: false,
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
      this.card = this.elements.create("card", {
        style: {
          base: {
            fontSize: '15px',
            color: '#0f172a',
            fontFamily: 'system-ui, sans-serif',
            '::placeholder': { color: '#94a3b8' },
          },
        },
      });
      this.card.mount("#card-element");
    },
    async pay() {
      this.paying = true;
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        this.clientSecret,
        { payment_method: { card: this.card } }
      );
      this.paying = false;

      if (error) {
        this.$message.error(error.message);
      } else if (paymentIntent.status === "succeeded") {
        this.$message.success("Payment successful! Redirecting to your orders...");
        setTimeout(() => { this.$router.push("/orders"); }, 1500);
      }
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
  padding: 60px 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.payment-wrapper {
  display: flex;
  gap: 64px;
  align-items: flex-start;
}

/* ── Left info ── */
.payment-info {
  flex: 1;
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.section-title {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -1px;
  line-height: 1.1;
}

.section-desc {
  font-size: 15px;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 32px;
}

.security-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* ── Payment card ── */
.payment-card {
  width: 420px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.card-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}

.card-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 28px;
}

.stripe-field-wrap {
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
  letter-spacing: 0.01em;
}

.stripe-input {
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fafafa;
  min-height: 20px;
  transition: border-color 0.15s;
}

.stripe-input:focus-within {
  border-color: #2563eb;
}

.pay-btn {
  width: 100%;
  height: 50px;
  font-size: 15px;
  font-weight: 700;
  border-radius: 10px;
  background: #0f172a;
  border-color: #0f172a;
  letter-spacing: 0.02em;
  margin-bottom: 16px;
}

.pay-btn:hover {
  background: #1e293b;
  border-color: #1e293b;
}

.pay-note {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}
</style>
