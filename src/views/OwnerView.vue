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
        <el-aside width="200px" style="border: 1px solid #eee">
          <el-menu :default-openeds="['1', '3']">
            <el-sub-menu index="1">
              <template #title>Shop Management</template>
              <el-menu-item index="1-1">
                <router-link to="/owner">Product</router-link>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
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

            <el-button type="primary" @click="handleSearch"> Search </el-button>

            <el-button @click="handleReset"> Reset </el-button>
          </div>
          <div>
            <el-button type="primary" @click="openAdd">Add</el-button>
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
                <el-button type="primary" @click="handleDelete(scope.row)"
                  >delete</el-button
                >
                <el-button type="primary" @click="openUpdate(scope.row)">
                  Update
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div
            style="
              margin-top: auto;
              display: flex;
              justify-content: center;
              padding: 16px 0;
            "
          >
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
          <el-dialog title="Product Information" v-model="addDialogFormVisible">
            <el-form :model="form">
              <el-form-item label="Product name" :label-width="formLabelWidth">
                <el-input v-model="form.name" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="Description" :label-width="formLabelWidth">
                <el-input
                  v-model="form.description"
                  autocomplete="off"
                ></el-input>
              </el-form-item>
              <el-form-item label="Price" :label-width="formLabelWidth">
                <el-input v-model="form.price" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="Image" :label-width="formLabelWidth">
                <el-input v-model="form.imageUrl" autocomplete="off"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="addDialogFormVisible = false"
                >Cancel</el-button
              >
              <el-button type="primary" @click="handleAdd">Confirm</el-button>
            </template>
          </el-dialog>
          <el-dialog title="Update Information" v-model="editDialogFormVisible">
            <el-form :model="form">
              <el-form-item label="Product name" :label-width="formLabelWidth">
                <el-input v-model="form.name" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="Description" :label-width="formLabelWidth">
                <el-input
                  v-model="form.description"
                  autocomplete="off"
                ></el-input>
              </el-form-item>
              <el-form-item label="Price" :label-width="formLabelWidth">
                <el-input v-model="form.price" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="Image" :label-width="formLabelWidth">
                <el-input v-model="form.imageUrl" autocomplete="off"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="editDialogFormVisible = false"
                >Cancel</el-button
              >
              <el-button type="primary" @click="handleUpdate"
                >Confirm</el-button
              >
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
      formLabelWidth: "150px",
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
        "This action will permanently delete this dish. Continue?",
        "Warning",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "cancel",
          type: "warning",
        }
      )
        .then(() => {
          return request.delete(`/products/${row.id}`);
        })
        .then(() => {
          this.$message.success("Deleted Successfully");
          this.loadData();
        })
        .catch(() => {
          this.$message.info("Cancel Deletion");
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

    handleUpdate(row) {
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