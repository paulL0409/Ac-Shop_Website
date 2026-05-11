<template>
  <div>
    <el-container class="page-container">
      <el-header class="app-header">
        <span>{{ shopName }}</span>
        <div class="header-actions">
          <el-button class="header-btn" @click="handleReturn">Return</el-button>
          <el-button class="header-btn danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-container>
        <el-main class="main-content">
          <div class="toolbar">
            <el-input
              v-model="searchName"
              placeholder="Search by name"
              style="width: 200px"
              clearable
            />
            <el-input
              v-model="priceBegin"
              placeholder="Min Price"
              style="width: 120px"
              clearable
            />
            <el-input
              v-model="priceEnd"
              placeholder="Max Price"
              style="width: 120px"
              clearable
            />
            <el-button type="primary" @click="handleSearch">Search</el-button>
            <el-button @click="handleReset">Reset</el-button>
          </div>

          <el-table :data="tableData" style="width: 100%" border>
            <el-table-column prop="name" label="Name" width="180" />
            <el-table-column prop="description" label="Description" width="200" />
            <el-table-column prop="price" label="Price" width="100" />
            <el-table-column label="Image" width="100">
              <template #default="scope">
                <img
                  v-if="scope.row.imageUrl"
                  :src="scope.row.imageUrl"
                  class="table-img"
                  alt="product"
                />
                <img v-else src="https://placehold.co/60x60/e2e8f0/94a3b8?text=No+Image" class="table-img" alt="no image" />
              </template>
            </el-table-column>
            <el-table-column label="Operation" width="120">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleAdd(scope.row)">
                  Add to Cart
                </el-button>
              </template>
            </el-table-column>
          </el-table>

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

          <div class="cart-fab" @click="handleViewCart">
            🛒 View Cart
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
      shopId: null,
      shopName: "",
      total: 0,
      page: 1,
      pageSize: 10,
      searchName: "",
      priceBegin: "",
      priceEnd: "",
      form: { productId: null },
    };
  },
  mounted() {
    this.shopId = this.$route.params.id;
    this.shopName = this.$route.query.name;
    this.loadData();
  },
  methods: {
    loadData() {
      request
        .get("/products", {
          params: {
            shopId: this.shopId,
            page: this.page,
            pageSize: this.pageSize,
            name: this.searchName || null,
            begin: this.priceBegin || null,
            end: this.priceEnd || null,
          },
        })
        .then((response) => {
          const pageBean = response.data.data;
          this.tableData = pageBean.rows;
          this.total = pageBean.total;
        });
    },
    handleSearch() {
      this.page = 1;
      this.loadData();
    },
    handleReset() {
      this.searchName = "";
      this.priceBegin = "";
      this.priceEnd = "";
      this.page = 1;
      this.loadData();
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.loadData();
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.page = 1;
      this.loadData();
    },
    handleAdd(row) {
      this.form.productId = row.id;
      this.$message.success("Added to cart");
      request.post("/carts", this.form);
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
    handleViewCart() {
      this.$router.push("/cart");
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

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
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

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.cart-fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  background: #16a34a;
  color: #ffffff;
  padding: 12px 20px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}

.cart-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.5);
}
</style>
