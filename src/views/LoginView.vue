<template>
  <div class="login-page">

    <!-- Left: Marketing copy -->
    <div class="brand-side">
      <div class="brand-logo-wrap">
        <img src="@/assets/image/ac-shop-logo.png" class="brand-logo" alt="AC Shop" />
      </div>

      <h1 class="hero-heading">
        Discover a smarter shopping experience with
        <span class="accent"> AC Shop</span>
      </h1>

      <p class="hero-desc">
        A modern e-commerce platform designed for seamless product discovery,
        secure customer access, and an intuitive shopping experience.
      </p>
    </div>

    <!-- Right: Sign in card -->
    <div class="form-side">
      <div class="form-card">
        <h2 class="card-title">Sign In to Your Account</h2>
        <p class="card-sub">Access your account to browse stores, explore products, and manage your shopping cart.</p>

        <div class="field">
          <label class="field-label">Username</label>
          <input v-model="username" class="field-input" type="text"
            placeholder="Enter your username" autocomplete="username" />
        </div>

        <div class="field">
          <label class="field-label">Password</label>
          <input v-model="password" class="field-input" type="password"
            placeholder="••••••••••" autocomplete="current-password" @keyup.enter="login" />
        </div>

        <button class="btn-signin" @click="login">Sign In</button>

        <div class="divider"><span>or</span></div>

        <button class="btn-register" @click="openCreateUser">Create a new account</button>
      </div>
    </div>

    <!-- Create Account Dialog -->
    <el-dialog title="Create a New Account" v-model="createDialogFormVisible" width="480px">
      <p class="dlg-sub">Join AC Shop today. It only takes a moment.</p>
      <el-form :model="form" label-position="top" style="margin-top:20px">
        <el-form-item label="Username">
          <el-input v-model="form.username" placeholder="Choose a username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="form.password" placeholder="Create a password" show-password autocomplete="off" />
        </el-form-item>
        <el-form-item label="Account type">
          <el-select v-model="form.role" placeholder="Select your role" style="width:100%">
            <el-option label="Customer — Browse shops &amp; purchase products" value="CUSTOMER" />
            <el-option label="Owner — Manage your own shop &amp; products" value="OWNER" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleCreateUser">Create Account</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import request from "@/utils/request";
import { jwtDecode } from "jwt-decode";

export default {
  data() {
    return {
      username: "",
      password: "",
      createDialogFormVisible: false,
      form: { username: "", password: "", role: "" },
    };
  },
  methods: {
    login() {
      request.post("/login", { username: this.username, password: this.password })
        .then((res) => {
          if (res.data.code === 1) {
            this.$message.success("Welcome back!");
            const token = res.data.data;
            localStorage.setItem("token", token);
            const role = jwtDecode(token).role;
            if (role === "OWNER")         this.$router.push("/owner");
            else if (role === "CUSTOMER") this.$router.push("/user");
            else if (role === "ADMIN")    this.$router.push("/admin");
            else this.$router.push("/");
          } else {
            this.$message.error(res.data.msg || "Invalid credentials. Please try again.");
          }
        })
        .catch(() => this.$message.error("Unable to connect. Please try again later."));
    },
    openCreateUser() { this.createDialogFormVisible = true; },
    handleCreateUser() {
      request.post("/login/add", this.form).then(() => {
        this.createDialogFormVisible = false;
        this.$message.success("Account created! You can now sign in.");
        this.$router.push("/");
      });
    },
  },
};
</script>

<style scoped>
/* ── Page shell ── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: #090e1a;
  padding: 48px 7% 48px 8%;
  gap: 80px;
  font-family: system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}

/* ══════════════════════════════════
   Left – Brand copy
══════════════════════════════════ */
.brand-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 580px;
}

.brand-logo-wrap {
  background: #ffffff;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 36px;
  overflow: hidden;
  width: 150px;
  height: 150px;
}

.brand-logo-wrap img {
  width: 115%;
  height: 115%;
  object-fit: contain;
}

.brand-logo {
  height: 200px;
  width: auto;
  display: block;
  flex-shrink: 0;
}

.hero-heading {
  font-size: 68px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.05;
  letter-spacing: -2.5px;
  margin-bottom: 28px;
}

.accent {
  color: #22d3ee;
}

.hero-desc {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.48);
  line-height: 1.75;
  max-width: 480px;
}

/* ══════════════════════════════════
   Right – Sign in card
══════════════════════════════════ */
.form-side {
  flex: 0 0 auto;
  width: 460px;
}

.form-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 44px 40px 40px;
}

.card-title {
  font-size: 26px;
  font-weight: 800;
  color: #0a0e1a;
  letter-spacing: -0.6px;
  margin-bottom: 10px;
  line-height: 1.2;
}

.card-sub {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Fields */
.field { margin-bottom: 18px; }

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
}

.field-input {
  width: 100%;
  padding: 14px 18px;
  border: 1.5px solid #e2e8f0;
  border-radius: 50px;
  font-size: 15px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
}

.field-input::placeholder { color: #94a3b8; }

/* Buttons */
.btn-signin {
  width: 100%;
  padding: 15px;
  margin-top: 10px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, transform 0.15s;
}

.btn-signin:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-signin:active { transform: translateY(0); }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: #cbd5e1;
  font-size: 13px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.btn-register {
  width: 100%;
  padding: 14px;
  background: transparent;
  color: #0f172a;
  border: 1.5px solid #e2e8f0;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, border-color 0.2s;
}

.btn-register:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Dialog */
.dlg-sub {
  font-size: 14px;
  color: #64748b;
  margin: -4px 0 0;
}
</style>
