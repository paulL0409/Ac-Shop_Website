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
        <span>Orders</span>

        <div>
          <el-button @click="handleReturn">Return</el-button>
          <el-button type="danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-container>
        <el-main style="display: flex; flex-direction: column; height: 100%">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="id" label="Order ID"></el-table-column>
            <el-table-column prop="totalAmount" label="Total"></el-table-column>
            <el-table-column prop="status" label="Status"></el-table-column>
            <el-table-column prop="createTime" label="Time"></el-table-column>
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
      formLabelWidth: "150px",
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      request.get("/orders").then((response) => {
        console.log(response.data.data);
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