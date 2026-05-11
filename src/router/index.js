import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import OwnerView from '../views/OwnerView.vue'
import UserView from '../views/UserView.vue'
import ShopDetailView from '../views/ShopDetailView.vue'
import CartDetailView from '../views/CartDetailView.vue'
import OrdersView from '../views/OrdersView.vue'
import AdminView from '../views/AdminView.vue'
import PaymentView from '../views/PaymentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/owner',
      name: 'owner',
      component: OwnerView,
    },
    {
      path: '/user',
      name: 'user',
      component: UserView,
    },
    {
      path: '/shop/:id',
      name: 'shopDetail',
      component: ShopDetailView,
    },
    {
      path: '/cart',
      name: 'cartDetail',
      component: CartDetailView,
    },
    {
      path: '/orders',
      name: 'orderDetail',
      component: OrdersView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: "/payment/:orderId",
      component: PaymentView
    }
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem("token")

  if (to.path === "/login") return true
  if (!token) return "/login"

  return true
})

export default router
