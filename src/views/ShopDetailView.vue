<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="navbar-left">
        <img src="@/assets/image/ac-shop-logo.png" class="nav-logo" alt="AC Shop" />
        <button class="btn-back-nav" @click="handleReturn">← Back to Shops</button>
      </div>
      <div class="navbar-right">
        <button class="btn-cart" @click="handleViewCart">
          <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Cart ({{ cartCount }})
        </button>
        <button class="btn-logout" @click="handleLogout">Sign Out</button>
      </div>
    </header>

    <!-- Content -->
    <div class="content">
      <!-- Shop hero -->
      <div class="shop-hero">
        <div class="hero-left">
          <p class="hero-category">{{ shopData?.category || 'Shop' }}</p>
          <h1 class="hero-name">{{ shopData?.name || shopName }}</h1>
          <p class="hero-desc">Browse products from this shop and add items to your cart.</p>
          <div class="hero-badges">
            <span v-if="shopData?.rating" class="hero-badge">⭐ {{ shopData.rating }} rating</span>
            <span v-if="shopData?.productCount" class="hero-badge">{{ shopData.productCount }} products</span>
          </div>
        </div>
        <div class="hero-right">
          <img v-if="shopData?.imageUrl" :src="shopData.imageUrl" alt="shop" class="hero-img" />
          <div v-else class="hero-img-placeholder">🏪</div>
        </div>
      </div>

      <!-- Products header -->
      <div class="products-header">
        <div class="products-header-left">
          <h2 class="products-title">Products</h2>
          <p class="products-desc">{{ total }} item{{ total !== 1 ? 's' : '' }} available in this shop</p>
        </div>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchName"
            class="search-input"
            placeholder="Search products..."
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Price filter -->
      <div class="filter-bar">
        <span class="filter-label">Filter by price:</span>
        <input v-model="priceBegin" class="filter-input" placeholder="Min $" type="number" />
        <span class="filter-sep">—</span>
        <input v-model="priceEnd" class="filter-input" placeholder="Max $" type="number" />
        <button class="btn-apply" @click="handleSearch">Apply</button>
        <button class="btn-reset" @click="handleReset">Clear</button>
      </div>

      <!-- Product grid -->
      <div v-if="tableData.length === 0" class="empty-state">
        <p class="empty-icon">📦</p>
        <p class="empty-title">No products found</p>
        <p class="empty-desc">Try adjusting your search or filters.</p>
      </div>
      <div class="product-grid">
        <div v-for="product in tableData" :key="product.id" class="product-card">
          <div class="product-img-wrap">
            <img v-if="product.imageUrl" :src="product.imageUrl" alt="product" class="product-img" />
            <div v-else class="img-placeholder">📦</div>
            <span v-if="product.badge || product.tag" class="product-badge">{{ product.badge || product.tag }}</span>
          </div>
          <div class="product-body">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description || 'No description available.' }}</p>
            <div class="product-footer">
              <span class="product-price">${{ Number(product.price).toFixed(2) }}</span>
              <button class="btn-add" @click="handleAdd(product)">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="total > 0" class="pagination-bar">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[8, 16, 32]"
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
      shopId: null,
      shopName: "",
      shopData: null,
      cartCount: 0,
      total: 0,
      page: 1,
      pageSize: 16,
      searchName: "",
      priceBegin: "",
      priceEnd: "",
      form: { productId: null },
    };
  },
  mounted() {
    this.shopId = this.$route.params.id;
    this.shopName = this.$route.query.name;
    if (this.$route.query.imageUrl) {
      this.shopData = { ...this.shopData, imageUrl: this.$route.query.imageUrl };
    }
    this.loadShopData();
    this.loadData();
    this.loadCartCount();
  },
  methods: {
    loadShopData() {
      request.get("/shops/" + this.shopId).then((res) => {
        if (res.data?.data) this.shopData = res.data.data;
      }).catch(() => {});
    },
    loadCartCount() {
      request.get("/carts").then((res) => {
        const d = res.data?.data;
        this.cartCount = Array.isArray(d) ? d.length : (d?.total || d?.rows?.length || 0);
      }).catch(() => {});
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
    handleSearch() { this.page = 1; this.loadData(); },
    handleReset() { this.searchName = ""; this.priceBegin = ""; this.priceEnd = ""; this.page = 1; this.loadData(); },
    handlePageChange(newPage) { this.page = newPage; this.loadData(); },
    handleSizeChange(newSize) { this.pageSize = newSize; this.page = 1; this.loadData(); },
    handleAdd(row) {
      this.form.productId = row.id;
      request.post("/carts", this.form).then(() => {
        this.$message.success(`"${row.name}" added to cart`);
        this.cartCount += 1;
      });
    },
    handleReturn() { this.$router.back(); },
    handleViewCart() { this.$router.push("/cart"); },
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

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-logo {
  height: 52px;
  width: auto;
  object-fit: contain;
}

.navbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-cart {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: #ffffff;
  color: #0f172a;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, border-color 0.15s;
}

.btn-cart:hover { background: #f8fafc; border-color: #cbd5e1; }

.cart-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

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
  padding: 28px 32px 40px;
  max-width: 1240px;
  margin: 0 auto;
}

/* ── Shop hero ── */
.shop-hero {
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 40px;
  height: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.hero-left {
  flex: 0 0 44%;
  background: #0f172a;
  padding: 52px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.btn-back-nav {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #f1f5f9;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-back-nav:hover { background: #e2e8f0; }

.hero-category {
  font-size: 12px;
  font-weight: 800;
  color: #60a5fa;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-name {
  font-size: 42px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.05;
  letter-spacing: -1px;
}

.hero-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  max-width: 320px;
}

.hero-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hero-right {
  flex: 1;
  overflow: hidden;
  background: #e2e8f0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #cbd5e1;
}

/* ── Products header ── */
.products-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 24px;
}

.products-title {
  font-size: 26px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}

.products-desc {
  font-size: 14px;
  color: #64748b;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 14px;
  pointer-events: none;
}

.search-input {
  padding: 11px 16px 11px 40px;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  font-size: 14px;
  width: 280px;
  outline: none;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder { color: #94a3b8; }

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  padding: 14px 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.filter-input {
  width: 90px;
  padding: 7px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  color: #0f172a;
  background: #f8fafc;
}

.filter-input:focus { border-color: #2563eb; background: #ffffff; }

.filter-sep {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
}

.btn-apply {
  padding: 7px 16px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-apply:hover { background: #1e293b; }

.btn-reset {
  padding: 7px 14px;
  background: transparent;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.btn-reset:hover { background: #f1f5f9; color: #0f172a; }

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.empty-desc { font-size: 14px; color: #64748b; }

/* ── Product grid ── */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  border: 1px solid #f1f5f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.product-img-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f8fafc;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-img {
  transform: scale(1.04);
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #cbd5e1;
}

.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #0f172a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.product-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.2px;
}

.product-desc {
  font-size: 12px;
  color: #94a3b8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
}

.product-price {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.btn-add {
  padding: 7px 12px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-add:hover { background: #1d4ed8; }

.pagination-bar {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>
