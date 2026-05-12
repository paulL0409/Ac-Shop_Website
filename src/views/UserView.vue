<template>
  <div class="page">
    <!-- Navbar -->
    <header class="navbar">
      <div class="navbar-left">
        <img src="@/assets/image/ac-shop-logo.png" class="nav-logo" alt="AC Shop" />
      </div>
      <div class="navbar-right">
        <button class="btn-cart" @click="handleViewCart">
          <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Cart ({{ cartCount }})
        </button>
        <button class="btn-logout" @click="handleLogout">Sign Out</button>
      </div>
    </header>

    <!-- Hero banner -->
    <div class="hero-banner">
      <div class="hero-blob hero-blob-1" />
      <div class="hero-blob hero-blob-2" />
      <div class="hero-inner">
        <p class="hero-label">Customer Dashboard</p>
        <h1 class="hero-title">Browse Shops</h1>
        <p class="hero-sub">Select a shop to explore its products and add items to your cart.</p>
        <div class="hero-search-wrap">
          <span class="hero-search-icon">🔍</span>
          <input
            v-model="searchName"
            class="hero-search-input"
            placeholder="Search shops by name..."
            @keyup.enter="handleSearch"
          />
          <button class="hero-search-btn" @click="handleSearch">Search</button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="content">
      <div v-if="tableData.length === 0 && !loading" class="empty-state">
        <p class="empty-icon">🏪</p>
        <p class="empty-title">No shops found</p>
        <p class="empty-desc">Try adjusting your search or check back later.</p>
      </div>

      <div class="shop-grid">
        <div v-for="shop in tableData" :key="shop.id" class="shop-card">
          <div class="shop-card-img">
            <img v-if="shop.imageUrl" :src="shop.imageUrl" alt="shop" />
            <div v-else class="img-placeholder">🏪</div>
          </div>
          <div class="shop-card-body">
            <div class="shop-name-row">
              <h3 class="shop-name">{{ shop.name }}</h3>
              <span v-if="shop.rating" class="shop-rating">⭐ {{ shop.rating }}</span>
            </div>
            <p class="shop-category">{{ shop.category || shop.description || 'General' }}</p>
            <p v-if="shop.productCount" class="shop-products">{{ shop.productCount }} products available</p>
            <button class="btn-view" @click="handleInspect(shop)">View Products →</button>
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
          :page-sizes="[6, 12, 24]"
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
      cartCount: 0,
      total: 0,
      page: 1,
      pageSize: 12,
      searchName: "",
      loading: false,
    };
  },
  mounted() {
    this.loadData();
    this.loadCartCount();
  },
  methods: {
    loadData() {
      this.loading = true;
      request.get("/shops", {
        params: { page: this.page, pageSize: this.pageSize, name: this.searchName || null },
      }).then((response) => {
        const pageBean = response.data.data;
        this.tableData = pageBean.rows;
        this.total = pageBean.total;
      }).finally(() => { this.loading = false; });
    },
    loadCartCount() {
      request.get("/carts").then((res) => {
        const d = res.data?.data;
        this.cartCount = Array.isArray(d) ? d.length : (d?.total || d?.rows?.length || 0);
      }).catch(() => {});
    },
    handleSearch() { this.page = 1; this.loadData(); },
    handlePageChange(newPage) { this.page = newPage; this.loadData(); },
    handleSizeChange(newSize) { this.pageSize = newSize; this.page = 1; this.loadData(); },
    handleInspect(row) {
      this.$router.push({ path: "/shop/" + row.id, query: { name: row.name } });
    },
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

.navbar-left { display: flex; align-items: center; }

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

/* ── Hero banner ── */
.hero-banner {
  background: linear-gradient(135deg, #0f172a 0%, #162040 60%, #1a2a5e 100%);
  padding: 60px 32px 72px;
  position: relative;
  overflow: hidden;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.hero-blob-1 {
  width: 520px;
  height: 520px;
  background: #2563eb;
  opacity: 0.14;
  top: -180px;
  right: -60px;
}

.hero-blob-2 {
  width: 300px;
  height: 300px;
  background: #60a5fa;
  opacity: 0.09;
  bottom: -80px;
  left: 140px;
}

.hero-inner {
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-label {
  font-size: 11px;
  font-weight: 800;
  color: #60a5fa;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.hero-title {
  font-size: 52px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -2px;
  line-height: 1.05;
  margin-bottom: 14px;
}

.hero-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.48);
  margin-bottom: 36px;
  max-width: 460px;
  line-height: 1.65;
}

.hero-search-wrap {
  display: flex;
  align-items: center;
  max-width: 560px;
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 6px 6px 6px 20px;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s;
}

.hero-search-wrap:focus-within {
  border-color: rgba(96, 165, 250, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.hero-search-icon {
  font-size: 16px;
  margin-right: 10px;
  opacity: 0.5;
}

.hero-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: #ffffff;
  font-family: inherit;
}

.hero-search-input::placeholder { color: rgba(255, 255, 255, 0.36); }

.hero-search-btn {
  padding: 10px 24px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}

.hero-search-btn:hover { background: #1d4ed8; }

/* ── Content ── */
.content {
  padding: 40px 32px;
  max-width: 1240px;
  margin: 0 auto;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.empty-desc { font-size: 14px; color: #64748b; }

/* ── Shop grid ── */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.shop-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}

.shop-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
}

.shop-card-img {
  height: 200px;
  overflow: hidden;
  background: #f1f5f9;
}

.shop-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s;
}

.shop-card:hover .shop-card-img img {
  transform: scale(1.05);
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #cbd5e1;
}

.shop-card-body {
  padding: 20px 20px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 6px;
}

.shop-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.shop-name {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.shop-rating {
  font-size: 13px;
  font-weight: 700;
  color: #f59e0b;
  white-space: nowrap;
  flex-shrink: 0;
}

.shop-category {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shop-products {
  font-size: 12px;
  color: #94a3b8;
}

.btn-view {
  width: 100%;
  padding: 12px;
  background: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: auto;
  font-family: inherit;
  letter-spacing: 0.01em;
  transition: background 0.15s, transform 0.1s;
}

.btn-view:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-view:active { transform: translateY(0); }

.pagination-bar {
  margin-top: 48px;
  display: flex;
  justify-content: center;
}
</style>
