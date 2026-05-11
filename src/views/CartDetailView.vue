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
        <span>Cart</span>

        <div>
          <el-button @click="handleReturn">Return</el-button>
          <el-button type="danger" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>
      <el-container>
        <el-main style="display: flex; flex-direction: column; height: 100%">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="name" label="Name" width="180">
            </el-table-column>
            <el-table-column prop="imageUrl" label="Image" width="180">
            </el-table-column>
            <el-table-column prop="price" label="Price" width="180">
            </el-table-column>
            <el-table-column prop="quantity" label="Quantity" width="180">
            </el-table-column>
            <el-table-column prop="totalPrice" label="Total Price" width="180">
            </el-table-column>
            <el-table-column label="Operation">
              <template #default="scope">
                <el-button size="small" @click="inc(scope.row)">+</el-button>
                <el-button size="small" @click="dec(scope.row)">-</el-button>
                <el-button size="small" type="danger" @click="remove(scope.row)"
                  >Remove</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div style="position: fixed; right: 50px; bottom: 20px">
            <div style="font-size: 18px">Total: {{ cartTotal }}</div>
            <el-button type="success" @click="checkout"> Checkout </el-button>
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
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      request.get("/carts").then((response) => {
        console.log(response.data.data);
        this.tableData = response.data.data;
      });
    },

    inc(row) {
      request.put(`/carts/${row.id}/increase`).then((response) => {
        this.loadData();
      });
    },

    dec(row) {
      request.put(`/carts/${row.id}/decrease`).then((response) => {
        this.loadData();
      });
    },

    remove(row) {
      request.delete(`/carts/${row.id}`).then((response) => {
        this.loadData();
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
    checkout(){
      request.post("/orders/checkout").then(response => {
        const orderId = response.data.data;
        this.$message.success("Order placed successfully");
        this.$router.push(`/payment/${orderId}`)
      });
    }
  },
  computed: {
    cartTotal() {
      return this.tableData.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0),
        0
      );
    },
  },
};
</script>