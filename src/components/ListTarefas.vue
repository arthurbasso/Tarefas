<template>
  <div class="container">
    <h2>Tarefas</h2>

    <table v-if="tarefas.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Descrição</th>
          <th>Data de Criação</th>
          <th>Data Prevista</th>
          <th>Data de Encerramento</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tarefa in tarefas" :key="tarefa.id">
          <td>{{ tarefa.id }}</td>
          <td>{{ tarefa.descricao }}</td>
          <td>{{ tarefa.data_criacao }}</td>
          <td>{{ tarefa.data_prevista }}</td>
          <td>{{ tarefa.data_encerramento }}</td>
          <td>{{ tarefa.situacao }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>Nenhuma tarefa encontrada.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tarefas: [],
    };
  },
  methods: {
    async fetchTarefas() {
      try {
        const apiUrl = process.env.VUE_APP_API_URL || "http://177.44.248.53:3000";
        const response = await fetch(`${apiUrl}/tarefas`);
        this.tarefas = await response.json();
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
      }
    },
  },
  mounted() {
    this.fetchTarefas();
  },
};
</script>

<style>
.container {
  max-width: 800px;
  margin: auto;
  text-align: center;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #42b983;
  color: white;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>