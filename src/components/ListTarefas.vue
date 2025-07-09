<template>
  <div class="container">
    <div class="header">
      <h2>Lista de tarefas 2</h2>
      <button @click="logout" class="logout-btn">Logout</button>
      <button @click="exportarPDF" class="export-btn">Exportar PDF</button>
    </div>

    <div class="form">
      <label for="descricao">Descrição</label>
      <input id="descricao" v-model="novaTarefa.descricao" placeholder="Descrição" />

      <label for="data_prevista">Data Prevista</label>
      <input id="data_prevista" v-model="novaTarefa.data_prevista" type="date" placeholder="Data Prevista" />

      <button @click="criarTarefa" class="adicionar-btn">Adicionar</button>
    </div>

    <div class="filters">
      <label for="filtroData">Filtrar por Data de Criação:</label>
      <input id="filtroData" type="date" v-model="filtros.dataCriacao" />

      <label for="filtroSituacao">Filtrar por Situação:</label>
      <select id="filtroSituacao" v-model="filtros.situacao">
        <option value="">Todas</option>
        <option value="Em Andamento">Em Andamento</option>
        <option value="Concluída">Concluída</option>
        <option value="Cancelada">Cancelada</option>
      </select>

      <button @click="limparFiltros">Limpar Filtros</button>
    </div>

    <table v-if="tarefasFiltradas.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Descrição</th>
          <th>Data de Criação</th>
          <th>Data Prevista</th>
          <th>Data de Encerramento</th>
          <th>Situação</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tarefa in tarefasFiltradas" :key="tarefa.id">
          <td>{{ tarefa.id }}</td>
          <td>{{ tarefa.descricao }}</td>
          <td>{{ tarefa.data_criacao }}</td>
          <td>{{ tarefa.data_prevista }}</td>
          <td>{{ tarefa.data_encerramento }}</td>
          <td>{{ tarefa.situacao }}</td>
          <td>
            <button @click="marcarComoConcluida(tarefa)" v-if="tarefa.situacao !== 'Concluída' && tarefa.situacao !== 'Cancelada'">✔️</button>
            <button @click="cancelarTarefa(tarefa)" v-if="tarefa.situacao !== 'Concluída' && tarefa.situacao !== 'Cancelada'">❌</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Nenhuma tarefa encontrada.</p>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  data() {
    return {
      tarefas: [],
      novaTarefa: {
        descricao: '',
        data_prevista: '',
        situacao: 'Em Andamento',
      },
      filtros: {
        dataCriacao: '',
        situacao: '',
      },
    };
  },
  computed: {
    tarefasFiltradas() {
      return this.tarefas.filter(tarefa => {
        const dataOk = this.filtros.dataCriacao
          ? tarefa.data_criacao === this.filtros.dataCriacao
          : true;
        const situacaoOk = this.filtros.situacao
          ? tarefa.situacao === this.filtros.situacao
          : true;
        return dataOk && situacaoOk;
      });
    }
  },
  methods: {
    logout() {
      localStorage.clear();
      window.location.href = '/';
    },
    exportarPDF() {
      const doc = new jsPDF();
      doc.text('Lista de Tarefas', 14, 15);

      const rows = this.tarefasFiltradas.map(tarefa => [
        tarefa.id,
        tarefa.descricao,
        tarefa.data_criacao,
        tarefa.data_prevista,
        tarefa.data_encerramento,
        tarefa.situacao,
      ]);

      autoTable(doc, {
        head: [['ID', 'Descrição', 'Data de Criação', 'Data Prevista', 'Data de Encerramento', 'Situação']],
        body: rows,
        startY: 20,
      });

      doc.save('lista_tarefas.pdf');
    },
    limparFiltros() {
      this.filtros.dataCriacao = '';
      this.filtros.situacao = '';
    },
    async fetchTarefas() {
      try {
        const apiUrl = process.env.VUE_APP_API_URL;
        const response = await fetch(`${apiUrl}/tarefas`);
        const todasTarefas = await response.json();
        const usuarioId = localStorage.getItem('usuarioId');
        this.tarefas = todasTarefas.filter(tarefa => String(tarefa.idUsuario) === usuarioId);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
      }
    },
    async criarTarefa() {
      if (!this.novaTarefa.descricao || !this.novaTarefa.data_prevista) {
        alert('Descrição e data prevista são obrigatórias');
        return;
      }

      const usuarioId = localStorage.getItem('usuarioId');
      if (!usuarioId) {
        alert('Usuário não autenticado');
        return;
      }

      const tarefa = {
        descricao: this.novaTarefa.descricao,
        data_prevista: this.novaTarefa.data_prevista,
        idUsuario: usuarioId,
      };

      try {
        const apiUrl = process.env.VUE_APP_API_URL;
        const res = await fetch(`${apiUrl}/tarefas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tarefa),
        });

        if (res.ok) {
          this.novaTarefa = { descricao: '', data_prevista: '', situacao: 'Em Andamento' };
          this.fetchTarefas();
        } else {
          const erro = await res.json();
          alert('Erro ao criar tarefa: ' + erro.error);
        }
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        alert('Erro ao criar tarefa');
      }
    },
    async marcarComoConcluida(tarefa) {
      try {
        const apiUrl = process.env.VUE_APP_API_URL;
        const atualizada = {
          ...tarefa,
          situacao: 'Concluída',
          data_encerramento: new Date().toISOString().split('T')[0],
        };
        await fetch(`${apiUrl}/tarefas/${tarefa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(atualizada),
        });
        this.fetchTarefas();
      } catch (error) {
        console.error("Erro ao concluir tarefa:", error);
      }
    },
    async cancelarTarefa(tarefa) {
      try {
        const apiUrl = process.env.VUE_APP_API_URL;
        const atualizada = {
          ...tarefa,
          situacao: 'Cancelada',
          data_encerramento: new Date().toISOString().split('T')[0],
        };
        await fetch(`${apiUrl}/tarefas/${tarefa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(atualizada),
        });
        this.fetchTarefas();
      } catch (error) {
        console.error("Erro ao cancelar tarefa:", error);
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
  max-width: 900px;
  margin: 40px auto;
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

.form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start; 
  margin-bottom: 25px;
}

.form label {
  display: block;
  font-weight: bold;
  margin-top: 10px;
}

.form input,
.form button {
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.form button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.adicionar-btn {
  align-self: flex-start;
  margin-top: 16px;
  background-color: #3498db;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters input,
.filters select {
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.filters button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.export-btn {
  background-color: #8e44ad;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

th {
  background-color: #42b983;
  color: white;
}

tr:nth-child(even) {
  background-color: #f6f6f6;
}

tr:hover {
  background-color: #eef;
}

td button {
  margin: 0 4px;
  border-radius: 5px;
}
</style>
