<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">🛍️</div>
      <h1 class="login-title">AC Shop</h1>
      <p class="login-subtitle">Sign in to your account</p>

      <div class="form-group">
        <el-input
          placeholder="Username"
          v-model="username"
          size="large"
          prefix-icon="User"
        />
      </div>
      <div class="form-group">
        <el-input
          placeholder="Password"
          v-model="password"
          show-password
          size="large"
          prefix-icon="Lock"
        />
      </div>

      <el-button type="primary" class="login-btn" size="large" @click="login">
        Login
      </el-button>
      <el-button class="register-btn" size="large" @click="openCreateUser">
        Create Account
      </el-button>

      <el-dialog title="Create Account" v-model="createDialogFormVisible" width="420px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="Username">
            <el-input v-model="form.username" autocomplete="off" />
          </el-form-item>
          <el-form-item label="Password">
            <el-input v-model="form.password" show-password autocomplete="off" />
          </el-form-item>
          <el-form-item label="Role">
            <el-select v-model="form.role" placeholder="Select role" style="width: 100%">
              <el-option label="Customer" value="CUSTOMER" />
              <el-option label="Owner" value="OWNER" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="createDialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleCreateUser">Confirm</el-button>
        </template>
      </el-dialog>
    </div>
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
      form: {
        username: "",
        password: "",
        role: "",
      },
    };
  },
  methods: {
    login() {
      const user = {
        username: this.username,
        password: this.password,
      };

      request
        .post("/login", user)
        .then((response) => {
          if (response.data.code === 1) {
            this.$message.success("Login successful");
            const token = response.data.data;
            localStorage.setItem("token", token);
            const payload = jwtDecode(token);
            const role = payload.role;
            if (role === "OWNER") this.$router.push("/owner");
            else if (role === "CUSTOMER") this.$router.push("/user");
            else if (role === "ADMIN") this.$router.push("/admin");
            else this.$router.push("/");
          } else {
            this.$message.error(response.data.msg);
          }
        })
        .catch((error) => {
          console.log("Login failed:", error);
        });
    },
    openCreateUser() {
      this.createDialogFormVisible = true;
    },
    handleCreateUser() {
      return request.post("/login/add", this.form).then(() => {
        this.createDialogFormVisible = false;
        this.$message.success("Account created successfully");
        this.$router.push("/");
      });
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  font-size: 48px;
  margin-bottom: 8px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 28px 0;
}

.form-group {
  width: 100%;
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}

.register-btn {
  width: 100%;
  margin-top: 12px;
  height: 44px;
  font-size: 15px;
}
</style>
