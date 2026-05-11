<template>
  <div>
    <el-container class="page-container">
      <el-header class="app-header">
        <span>Orders</span>
        <div class="header-actions">
          <el-button class="header-btn" @click="handleReturn">Return</el-button>
          <el-button class="header-btn danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-container>
        <el-main class="main-content">
          <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="id" label="Order ID" width="120" />
            <el-table-column prop="totalAmount" label="Total" width="150" />
            <el-table-column label="Status" width="160">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 'PAID' ? 'success' : scope.row.status === 'PENDING' ? 'warning' : 'info'"
                >
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="Created Time" />
          </el-table>
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
      request.get("/orders").then((response) => {
        this.tableData = response.data.data;
      });
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

.main-content {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--color-bg-page);
}
</style>
