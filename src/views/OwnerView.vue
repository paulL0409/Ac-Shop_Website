<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-card">
          <img src="@/assets/image/ac-shop-logo.png" class="sidebar-logo-img" alt="AC Shop" />
        </div>
      </div>
      <div class="sidebar-role-badge">Shop Owner</div>
      <nav class="sidebar-nav">
        <div class="nav-section">Shop Management</div>
        <div class="nav-item active">
          <span class="nav-icon">📦</span> Products
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="shop-name-label">Active Shop</div>
        <div class="shop-name-value">{{ shopName || 'Loading...' }}</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-col">
      <!-- No shop: create shop prompt -->
      <div v-if="noShop" class="no-shop-screen">
        <div class="no-shop-card">
          <div class="no-shop-icon">🏪</div>
          <h2 class="no-shop-title">You don't have a shop yet</h2>
          <p class="no-shop-desc">Create your shop to start managing products and selling to customers.</p>
          <button class="btn-create-shop" @click="createShopDialogVisible = true">Create My Shop</button>
        </div>
      </div>

      <template v-else>
      <!-- Header -->
      <header class="top-bar">
        <div class="top-bar-left">
          <h1 class="page-title">Products</h1>
          <p class="page-subtitle">Manage your shop's product catalogue.</p>
        </div>
        <div class="top-bar-right">
          <button class="btn-ghost" @click="handleReturn">← Return</button>
          <button class="btn-danger" @click="handleLogout">Sign Out</button>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchName" placeholder="Search by name..." style="width:200px" clearable />
          <el-input v-model="priceBegin" placeholder="Min price" style="width:110px" clearable />
          <el-input v-model="priceEnd" placeholder="Max price" style="width:110px" clearable />
          <button class="btn-primary" @click="handleSearch">Search</button>
          <button class="btn-ghost" @click="handleReset">Reset</button>
        </div>
        <button class="btn-add" @click="openAdd">+ Add Product</button>
      </div>

      <!-- Table -->
      <div class="table-card">
        <el-table :data="tableData" style="width:100%" :border="false">
          <el-table-column prop="name" label="Product Name" min-width="160" />
          <el-table-column prop="description" label="Description" min-width="200" />
          <el-table-column label="Price" width="110">
            <template #default="scope">
              <span class="price-cell">${{ Number(scope.row.price).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Image" width="90" align="center">
            <template #default="scope">
              <img v-if="scope.row.imageUrl" :src="scope.row.imageUrl" class="table-img" alt="product" />
              <div v-else class="table-img-placeholder" />
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="160" align="center">
            <template #default="scope">
              <div class="action-btns">
                <button class="btn-action-edit" @click="openUpdate(scope.row)">Edit</button>
                <button class="btn-action-del" @click="handleDelete(scope.row)">Delete</button>
              </div>
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
      </template>
    </div>

    <!-- Create Shop Dialog -->
    <el-dialog title="Create Your Shop" v-model="createShopDialogVisible" width="520px" :close-on-click-modal="false">
      <p class="dialog-subtitle">Set up your shop to start selling products.</p>
      <el-form :model="shopForm" label-width="120px" class="dialog-form">
        <el-form-item label="Shop Name">
          <el-input v-model="shopForm.name" placeholder="e.g. My Awesome Store" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Category">
          <el-input v-model="shopForm.category" placeholder="e.g. Electronics, Clothing..." autocomplete="off" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="shopForm.description" placeholder="Briefly describe your shop" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Shop Image">
          <div
            class="drop-zone"
            :class="{ 'drop-zone--active': isShopDragging, 'drop-zone--uploading': shopUploading }"
            @click="$refs.shopFileInput.click()"
            @dragover.prevent="isShopDragging = true"
            @dragleave.prevent="isShopDragging = false"
            @drop.prevent="onShopDrop"
          >
            <img v-if="shopForm.imageUrl" :src="shopForm.imageUrl" class="drop-preview" alt="preview" />
            <template v-else>
              <span class="drop-icon">{{ shopUploading ? '⏳' : '📷' }}</span>
              <span class="drop-text">{{ shopUploading ? 'Uploading...' : 'Click or drag an image here' }}</span>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="btn-ghost" @click="createShopDialogVisible = false">Cancel</button>
        <button class="btn-primary" :disabled="shopUploading" @click="handleCreateShop">Create Shop</button>
      </template>
    </el-dialog>

    <!-- Hidden file inputs -->
    <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
    <input ref="shopFileInput" type="file" accept="image/*" style="display:none" @change="onShopFileChange" />

    <!-- Add Product Dialog -->
    <el-dialog title="Add New Product" v-model="addDialogFormVisible" width="520px">
      <p class="dialog-subtitle">Fill in the details to add a new product to your shop.</p>
      <el-form :model="form" label-width="120px" class="dialog-form">
        <el-form-item label="Product Name">
          <el-input v-model="form.name" placeholder="e.g. Wireless Headphones" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" placeholder="Brief product description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Price ($)">
          <el-input v-model="form.price" placeholder="e.g. 29.99" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Image">
          <div
            class="drop-zone"
            :class="{ 'drop-zone--active': isDragging, 'drop-zone--uploading': uploading }"
            @click="$refs.fileInput.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <img v-if="form.imageUrl" :src="form.imageUrl" class="drop-preview" alt="preview" />
            <template v-else>
              <span class="drop-icon">{{ uploading ? '⏳' : '📷' }}</span>
              <span class="drop-text">{{ uploading ? 'Uploading...' : 'Click or drag an image here' }}</span>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="btn-ghost" @click="addDialogFormVisible = false">Cancel</button>
        <button class="btn-primary" :disabled="uploading" @click="handleAdd">Add Product</button>
      </template>
    </el-dialog>

    <!-- Edit Product Dialog -->
    <el-dialog title="Edit Product" v-model="editDialogFormVisible" width="520px">
      <p class="dialog-subtitle">Update the product details below.</p>
      <el-form :model="form" label-width="120px" class="dialog-form">
        <el-form-item label="Product Name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Price ($)">
          <el-input v-model="form.price" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Image">
          <div
            class="drop-zone"
            :class="{ 'drop-zone--active': isDragging, 'drop-zone--uploading': uploading }"
            @click="$refs.fileInput.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <img v-if="form.imageUrl" :src="form.imageUrl" class="drop-preview" alt="preview" />
            <template v-else>
              <span class="drop-icon">{{ uploading ? '⏳' : '📷' }}</span>
              <span class="drop-text">{{ uploading ? 'Uploading...' : 'Click or drag an image here' }}</span>
            </template>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="btn-ghost" @click="editDialogFormVisible = false">Cancel</button>
        <button class="btn-primary" :disabled="uploading" @click="handleUpdate">Save Changes</button>
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
      tableData: [],
      total: 0,
      page: 1,
      pageSize: 10,
      searchName: "",
      priceBegin: "",
      priceEnd: "",
      addDialogFormVisible: false,
      editDialogFormVisible: false,
      createShopDialogVisible: false,
      uploading: false,
      isDragging: false,
      shopUploading: false,
      isShopDragging: false,
      noShop: false,
      form: { shopId: null, name: "", description: "", price: "", imageUrl: null },
      shopForm: { name: "", category: "", description: "", imageUrl: null },
      shopId: null,
      shopName: "",
    };
  },
  mounted() {
    request.get("/shops/my").then((shopRes) => {
      const shop = shopRes.data?.data;
      if (!shop) {
        this.noShop = true;
        return;
      }
      this.shopId = shop.id;
      this.shopName = shop.name;
      this.loadData();
    }).catch(() => {
      this.noShop = true;
    });
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      e.target.value = "";
      if (file) this.doUpload(file);
    },
    onDrop(e) {
      this.isDragging = false;
      const file = e.dataTransfer.files[0];
      if (file) this.doUpload(file);
    },
    onShopFileChange(e) {
      const file = e.target.files[0];
      e.target.value = "";
      if (file) this.doShopUpload(file);
    },
    onShopDrop(e) {
      this.isShopDragging = false;
      const file = e.dataTransfer.files[0];
      if (file) this.doShopUpload(file);
    },
    async doShopUpload(file) {
      if (!file.type.startsWith("image/")) { this.$message.error("Only image files are allowed"); return; }
      if (file.size / 1024 / 1024 > 5) { this.$message.error("Image must be smaller than 5 MB"); return; }
      this.shopUploading = true;
      this.shopForm.imageUrl = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await request.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
        this.shopForm.imageUrl = res.data.data;
        this.$message.success("Image uploaded successfully");
      } catch {
        this.shopForm.imageUrl = null;
        this.$message.error("Image upload failed. Please try again.");
      } finally {
        this.shopUploading = false;
      }
    },
    async doUpload(file) {
      if (!file.type.startsWith("image/")) {
        this.$message.error("Only image files are allowed");
        return;
      }
      if (file.size / 1024 / 1024 > 5) {
        this.$message.error("Image must be smaller than 5 MB");
        return;
      }
      this.uploading = true;
      this.form.imageUrl = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await request.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.form.imageUrl = res.data.data;
        this.$message.success("Image uploaded successfully");
      } catch (err) {
        console.error("Upload failed:", err.response?.status, err.response?.data ?? err.message);
        this.form.imageUrl = null;
        this.$message.error("Image upload failed. Please try again.");
      } finally {
        this.uploading = false;
      }
    },
    loadData() {
      request.get("/products", {
        params: {
          shopId: this.shopId,
          page: this.page,
          pageSize: this.pageSize,
          name: this.searchName || null,
          begin: this.priceBegin || null,
          end: this.priceEnd || null,
        },
      }).then((response) => {
        const pageBean = response.data.data;
        this.tableData = pageBean.rows;
        this.total = pageBean.total;
      });
    },
    handlePageChange(newPage) { this.page = newPage; this.loadData(); },
    handleSizeChange(newSize) { this.pageSize = newSize; this.page = 1; this.loadData(); },
    handleDelete(row) {
      this.$confirm(`Permanently delete "${row.name}"? This cannot be undone.`, "Delete Product", {
        confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning",
      }).then(() => request.delete(`/products/${row.id}`)).then(() => {
        this.$message.success("Product deleted successfully");
        this.loadData();
      }).catch(() => {});
    },
    handleCreateShop() {
      if (!this.shopForm.name) { this.$message.error("Shop name is required"); return; }
      const decoded = jwtDecode(localStorage.getItem("token"));
      const ownerId = decoded.id || decoded.userId || decoded.sub;
      request.post("/shops", { ...this.shopForm, ownerId }).then(() => {
        return request.get("/shops/my");
      }).then((shopRes) => {
        const shop = shopRes.data?.data;
        if (!shop) { this.$message.error("Shop created but could not load it. Please refresh."); return; }
        this.shopId = shop.id;
        this.shopName = shop.name;
        this.createShopDialogVisible = false;
        this.noShop = false;
        this.$message.success("Shop created! Welcome to your store.");
        this.loadData();
      }).catch((err) => {
        this.$message.error(err.response?.data?.msg || "Failed to create shop. Please try again.");
      });
    },
    openAdd() { this.resetForm(); this.addDialogFormVisible = true; },
    handleAdd() {
      if (!this.shopId) { this.$message.error("Shop info not loaded. Please refresh the page."); return; }
      if (!this.form.name) { this.$message.error("Product name is required"); return; }
      if (!this.form.price) { this.$message.error("Price is required"); return; }
      this.form.shopId = this.shopId;
      this.form.price = Number(this.form.price);
      request.post("/products", this.form).then(() => {
        this.$message.success("Product added successfully");
        this.addDialogFormVisible = false;
        this.loadData();
        this.resetForm();
      }).catch((err) => {
        this.$message.error(err.response?.data?.msg || "Failed to add product. Please try again.");
      });
    },
    openUpdate(row) { this.form = { ...row }; this.editDialogFormVisible = true; },
    handleUpdate() {
      if (!this.form.name) { this.$message.error("Product name is required"); return; }
      if (!this.form.price) { this.$message.error("Price is required"); return; }
      this.form.price = Number(this.form.price);
      request.put("/products", this.form).then(() => {
        this.$message.success("Product updated successfully");
        this.editDialogFormVisible = false;
        this.loadData();
        this.resetForm();
      }).catch((err) => {
        this.$message.error(err.response?.data?.msg || "Failed to update product. Please try again.");
      });
    },
    resetForm() {
      this.form = { shopId: null, name: "", description: null, price: null, imageUrl: null };
    },
    handleSearch() { this.page = 1; this.loadData(); },
    handleReset() {
      this.searchName = ""; this.priceBegin = ""; this.priceEnd = "";
      this.page = 1; this.loadData();
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
  background: rgba(37, 99, 235, 0.2);
  color: #93c5fd;
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
.nav-item.active { background: rgba(37, 99, 235, 0.15); color: #93c5fd; font-weight: 700; }

.nav-icon { font-size: 15px; }

.sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.shop-name-label {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.shop-name-value {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── No shop screen ── */
.no-shop-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-shop-card {
  text-align: center;
  background: #ffffff;
  border-radius: 20px;
  padding: 64px 48px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
  max-width: 440px;
}

.no-shop-icon { font-size: 56px; margin-bottom: 16px; }
.no-shop-title { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; letter-spacing: -0.4px; }
.no-shop-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 28px; }

.btn-create-shop {
  padding: 13px 32px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-create-shop:hover { background: #1e293b; }

/* ── Main column ── */
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

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Table card ── */
.table-card {
  margin: 24px 28px 0;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border: 1px solid #f1f5f9;
}

.table-img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}

.table-img-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: #e2e8f0;
  margin: 0 auto;
}

.price-cell {
  font-weight: 700;
  color: #0f172a;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.btn-action-edit {
  padding: 5px 12px;
  background: #dbeafe;
  color: #2563eb;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-action-edit:hover { background: #bfdbfe; }

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

/* ── Drop zone ── */
.drop-zone {
  width: 220px;
  height: 160px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
  background: #fafafa;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: #2563eb;
  background: #eff6ff;
}

.drop-zone--uploading { cursor: not-allowed; opacity: 0.6; }
.drop-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.drop-icon { font-size: 28px; }
.drop-text { font-size: 12px; color: #64748b; text-align: center; padding: 0 12px; }

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
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-add {
  padding: 9px 20px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-add:hover { background: #1e293b; }

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

/* ── Dialog ── */
.dialog-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: -8px 0 8px 0;
}

.dialog-form {
  padding: 8px 0;
}
</style>
