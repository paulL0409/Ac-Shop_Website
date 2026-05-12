<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-card">
          <img src="@/assets/image/ac-shop-logo.png" class="sidebar-logo-img" alt="AC Shop" />
        </div>
      </div>
      <div class="sidebar-role-badge">Admin Panel</div>
      <nav class="sidebar-nav">
        <div class="nav-section">Management</div>
        <div class="nav-item active">
          <span class="nav-icon">👥</span> Users
        </div>
      </nav>
    </aside>

    <!-- Main -->
    <div class="main-col">
      <!-- Header -->
      <header class="top-bar">
        <div class="top-bar-left">
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">View, search, and manage all registered users.</p>
        </div>
        <div class="top-bar-right">
          <button class="btn-ghost" @click="handleReturn">← Return</button>
          <button class="btn-danger" @click="handleLogout">Sign Out</button>
        </div>
      </header>

      <!-- Stat bar -->
      <div class="stat-bar">
        <div class="stat-card">
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchName"
            placeholder="Search by username..."
            style="width:220px"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-select v-model="searchRole" placeholder="All roles" style="width:150px" clearable>
            <el-option label="Admin" value="ADMIN" />
            <el-option label="Owner" value="OWNER" />
            <el-option label="Customer" value="CUSTOMER" />
          </el-select>
          <button class="btn-primary" @click="handleSearch">Search</button>
          <button class="btn-ghost" @click="handleReset">Reset</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <el-table :data="tableData" style="width:100%" :border="false">
          <el-table-column prop="username" label="Username" min-width="160" />
          <el-table-column label="Role" width="140">
            <template #default="scope">
              <span :class="['role-pill', 'role-' + scope.row.role.toLowerCase()]">
                {{ scope.row.role }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="Member Since" min-width="180" />
          <el-table-column label="Actions" width="120" align="center">
            <template #default="scope">
              <button class="btn-action-del" @click="handleDelete(scope.row)">Delete</button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-bar">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
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
      total: 0,
      page: 1,
      pageSize: 10,
      searchName: "",
      searchRole: "",
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      request.get("/users", {
        params: {
          page: this.page,
          pageSize: this.pageSize,
          username: this.searchName || null,
          role: this.searchRole || null,
        },
      }).then((response) => {
        const pageBean = response.data.data;
        this.tableData = pageBean.rows;
        this.total = pageBean.total;
      });
    },
    handleDelete(row) {
      this.$confirm(`Permanently delete user "${row.username}"? This action cannot be undone.`, "Delete User", {
        confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning",
      }).then(() => request.delete(`/users/${row.id}`)).then(() => {
        this.$message.success("User deleted successfully");
        this.loadData();
      }).catch(() => {});
    },
    handleSearch() { this.page = 1; this.loadData(); },
    handleReset() { this.searchName = ""; this.searchRole = ""; this.page = 1; this.loadData(); },
    handlePageChange(newPage) { this.page = newPage; this.loadData(); },
    handleSizeChange(newSize) { this.pageSize = newSize; this.page = 1; this.loadData(); },
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
/* ── Layout ── */
.layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* ── Sidebar ── */
.sidebar {
  width: 240px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.sidebar-logo-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-logo-img {
  height: 60px;
  width: auto;
  object-fit: contain;
  display: block;
}

.sidebar-role-badge {
  margin: 16px 16px 0;
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

.nav-section {
  padding: 12px 24px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #475569;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  font-size: 14px;
  color: #94a3b8;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-weight: 500;
}

.nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #e2e8f0; }
.nav-item.active { background: rgba(239, 68, 68, 0.12); color: #fca5a5; font-weight: 700; }

.nav-icon { font-size: 15px; }

/* ── Main ── */
.main-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  flex-shrink: 0;
}

.top-bar-left {}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
}

.top-bar-right {
  display: flex;
  gap: 8px;
}

/* ── Stat bar ── */
.stat-bar {
  display: flex;
  gap: 16px;
  padding: 24px 28px 0;
}

.stat-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  min-width: 160px;
  border: 1px solid #f1f5f9;
}

.stat-value {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Table card ── */
.table-card {
  margin: 0 28px;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border: 1px solid #f1f5f9;
}

/* ── Role pills ── */
.role-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.role-admin { background: #fee2e2; color: #dc2626; }
.role-owner { background: #fef3c7; color: #b45309; }
.role-customer { background: #dbeafe; color: #1d4ed8; }

.btn-action-del {
  padding: 5px 12px;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-action-del:hover { background: #fecaca; }

/* ── Pagination ── */
.pagination-bar {
  padding: 24px 28px;
  display: flex;
  justify-content: center;
}

/* ── Buttons ── */
.btn-primary {
  padding: 8px 18px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-primary:hover { background: #1d4ed8; }

.btn-ghost {
  padding: 8px 16px;
  background: transparent;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-ghost:hover { background: #f1f5f9; color: #0f172a; }

.btn-danger {
  padding: 8px 16px;
  background: transparent;
  color: #ef4444;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-danger:hover { background: #fee2e2; }
</style>
