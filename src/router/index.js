import { createRouter, createWebHistory } from 'vue-router';
import List from '../components/ListTarefas.vue';
import Login from '../components/UserLogin.vue';
import Register from '../components/UserRegister.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/listaTarefas', component: List },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;