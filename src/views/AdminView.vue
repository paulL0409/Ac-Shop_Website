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
        <span>Admin</span>

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
              placeholder="Search user name"
              style="width: 240px"
              clearable
            />
            <el-input
              v-model="searchRole"
              placeholder="Role"
              style="width: 120px"
              clearable
            />
            <el-button type="primary" @click="handleSearch">Search</el-button>
            <el-button @click="handleReset">Reset</el-button>
          </div>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="username" label="User Name" width="180">
            </el-table-column>
            <el-table-column prop="userPassword" label="Password" width="180">
            </el-table-column>
            <el-table-column prop="role" label="Role"> </el-table-column>
            <el-table-column prop="createTime" label="Created Time">
            </el-table-column>
            <el-table-column label="Operation">
              <template #default="scope">
                <el-button type="primary" @click="handleDelete(scope.row)"
                  >delete</el-button
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
      form: {
        username: "",
        userPassword: "",
        role: "",
        createTime: "",
      },
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
      request
        .get("/users", {
          params: {
            page: this.page,
            pageSize: this.pageSize,
            username: this.searchName || null,
            role: this.searchRole || null,
          },
        })
        .then((response) => {
          const pageBean = response.data.data;
          this.tableData = pageBean.rows;
          this.total = pageBean.total;
        });
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
          return request.delete(`/users/${row.id}`);
        })
        .then(() => {
          this.$message.success("Deleted Successfully");
          this.loadData();
        })
        .catch(() => {
          this.$message.info("Cancel Deletion");
        });
    },

    handleSearch() {
      this.page = 1;
      this.loadData();
    },

    handleReset() {
      this.searchName = "";
      (this.searchRole = ""), (this.page = 1);
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