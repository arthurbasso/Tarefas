<template>
  <div class="register">
    <h2>Criação de Conta</h2>
    <input v-model="nome" placeholder="Nome" />
    <input v-model="email" placeholder="Email" />
    <input v-model="senha" type="password" placeholder="Senha" />
    <button @click="registrar">Registrar</button>
    <p>Já tem conta? <router-link to="/login">Entrar</router-link></p>
  </div>
</template>

<script>
export default {
  data() {
    return { nome: '', email: '', senha: '' };
  },
  methods: {
    async registrar() {
      if (!this.nome || !this.email || !this.senha) {
        alert('Todos os campos são obrigatórios');
        return;
      }

      const res = await fetch(`${process.env.VUE_APP_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: this.nome, email: this.email, senha: this.senha }),
      });
      if (res.ok) {
        alert('Conta criada! Faça login.');
        this.$router.push('/login');
      } else {
        alert('Erro ao registrar');
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