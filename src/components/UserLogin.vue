<template>
    <div class="login">
      <h2>Login</h2>
      <input v-model="email" placeholder="Email" />
      <input v-model="senha" type="password" placeholder="Senha" />
      <button @click="login">Entrar</button>
      <p>Não tem conta? <router-link to="/register">Crie aqui</router-link></p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return { email: '', senha: '' };
    },
    methods: {
      async login() {
        const res = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, senha: this.senha }),
        });
        const user = await res.json();
        if (res.ok) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('usuarioId', user.id);
          this.$router.push('/listaTarefas');
        } else {
          alert('Login falhou!');
        }
      }
    }
  };
</script>  
<style>
.login, .register {
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login input,
.register input {
  margin-bottom: 15px;
}

.login button,
.register button {
  width: 100%;
  max-width: 300px;
  margin-top: 10px;
}

.login p,
.register p {
  margin-top: 20px;
}
</style>