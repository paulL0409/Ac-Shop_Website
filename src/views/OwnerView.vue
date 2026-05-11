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
        <el-aside width="200px" class="sidebar">
          <el-menu :default-openeds="['1']">
            <el-sub-menu index="1">
              <template #title>Shop Management</template>
              <el-menu-item index="1-1">
                <router-link to="/owner">Product</router-link>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
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

          <div style="margin-bottom: 12px">
            <el-button type="primary" @click="openAdd">+ Add Product</el-button>
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
            <el-table-column label="Operation" width="160">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                  Delete
                </el-button>
                <el-button type="primary" size="small" @click="openUpdate(scope.row)">
                  Update
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

          <el-dialog title="Add Product" v-model="addDialogFormVisible" width="480px">
            <el-form :model="form" label-width="120px">
              <el-form-item label="Product Name">
                <el-input v-model="form.name" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Description">
                <el-input v-model="form.description" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Price">
                <el-input v-model="form.price" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Image URL">
                <div class="img-input-wrap">
                  <el-input v-model="form.imageUrl" placeholder="Paste URL or click Random" autocomplete="off" />
                  <el-button @click="randomImage">Random</el-button>
                </div>
                <img v-if="form.imageUrl" :src="form.imageUrl" class="img-preview" alt="preview" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="addDialogFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="handleAdd">Confirm</el-button>
            </template>
          </el-dialog>

          <el-dialog title="Update Product" v-model="editDialogFormVisible" width="480px">
            <el-form :model="form" label-width="120px">
              <el-form-item label="Product Name">
                <el-input v-model="form.name" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Description">
                <el-input v-model="form.description" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Price">
                <el-input v-model="form.price" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Image URL">
                <div class="img-input-wrap">
                  <el-input v-model="form.imageUrl" placeholder="Paste URL or click Random" autocomplete="off" />
                  <el-button @click="randomImage">Random</el-button>
                </div>
                <img v-if="form.imageUrl" :src="form.imageUrl" class="img-preview" alt="preview" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="editDialogFormVisible = false">Cancel</el-button>
              <el-button type="primary" @click="handleUpdate">Confirm</el-button>
            </template>
          </el-dialog>
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
      total: 0,
      page: 1,
      pageSize: 10,
      searchName: "",
      priceBegin: "",
      priceEnd: "",
      addDialogFormVisible: false,
      editDialogFormVisible: false,
      form: {
        shopId: null,
        name: "",
        description: "",
        price: "",
        imageUrl: "",
      },
      shopId: null,
      shopName: "",
    };
  },
  mounted() {
    request.get("/shops/my").then((shopRes) => {
      this.shopId = shopRes.data.data.id;
      this.shopName = shopRes.data.data.name;
      this.loadData();
    });
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
    handlePageChange(newPage) {
      this.page = newPage;
      this.loadData();
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.page = 1;
      this.loadData();
    },
    handleDelete(row) {
      this.$confirm(
        "This action will permanently delete this product. Continue?",
        "Warning",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => request.delete(`/products/${row.id}`))
        .then(() => {
          this.$message.success("Deleted successfully");
          this.loadData();
        })
        .catch(() => {
          this.$message.info("Deletion cancelled");
        });
    },
    openAdd() {
      this.resetForm();
      this.addDialogFormVisible = true;
    },
    handleAdd() {
      this.form.shopId = this.shopId;
      return request.post("/products", this.form).then(() => {
        this.addDialogFormVisible = false;
        this.loadData();
        this.resetForm();
      });
    },
    openUpdate(row) {
      this.form = { ...row };
      this.editDialogFormVisible = true;
    },
    handleUpdate() {
      return request.put("/products", this.form).then(() => {
        this.$message.success("Updated successfully");
        this.editDialogFormVisible = false;
        this.loadData();
        this.resetForm();
      });
    },
    resetForm() {
      this.form = {
        shopId: null,
        name: "",
        description: null,
        price: null,
        imageUrl: null,
      };
    },
    randomImage() {
      const seed = Math.random().toString(36).slice(2, 8);
      this.form.imageUrl = `https://picsum.photos/seed/${seed}/400/300`;
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

.sidebar {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
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

.img-input-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.img-preview {
  margin-top: 10px;
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: block;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
