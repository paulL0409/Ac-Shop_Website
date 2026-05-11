<template>
  <div>
    <el-container style="height: 700px; border: 1px solid #eee">
      <el-header
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 40px;
          background-color: rgb(238, 241, 246);
          padding: 0 20px;
        "
      >
        <span>{{ this.shopName }}</span>

        <div>
          <el-button @click="handleReturn">Return</el-button>
          <el-button type="danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-container>
        <el-main style="display: flex; flex-direction: column; height: 100%">
          <div
            style="
              margin-bottom: 12px;
              display: flex;
              gap: 10px;
              align-items: center;
            "
          >
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
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="name" label="Name" width="180">
            </el-table-column>
            <el-table-column prop="description" label="Description" width="180">
            </el-table-column>
            <el-table-column prop="price" label="Price"> </el-table-column>
            <el-table-column prop="imageUrl" label="Image"> </el-table-column>
            <el-table-column label="Operation">
              <template #default="scope">
                <el-button type="primary" @click="handleAdd(scope.row)"
                  >Add</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: auto; display: flex; justify-content: center">
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
          <div style="position: fixed; right: 50px; bottom: 20px;">
            <el-button type="success" @click="handleViewCart">
              View Cart
            </el-button>
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
      formLabelWidth: "150px",
      shopId: null,
      shopName: "",
      total: 0,
      page: 1,
      pageSize: 10,
      searchName: "",
      priceBegin: "",
      priceEnd: "",
      form: {
        productId: null,
      },
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
      this.$message.success("Added successfully");
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