const sqlite3 = require('sqlite3').verbose();
const request = require('supertest');
const createApp = require('../app');

jest.mock('nodemailer');

const nodemailer = require('nodemailer');

nodemailer.createTransport.mockReturnValue({
  sendMail: jest.fn((mailOptions, callback) => {
    callback(null, { response: 'Email enviado com sucesso' });
  }),
});


let db;
let app;


beforeAll((done) => {
  db = new sqlite3.Database(':memory:');
  app = createApp(db);
  setTimeout(done, 100);
});

afterAll((done) => {
  db.close(done);
});

describe('API Tests', () => {
  let userId, taskId;

  test('01 - Cadastrar usuário', async () => {
    const res = await request(app).post('/register').send({
      nome: 'Teste',
      email: 'teste@email.com',
      senha: '1234'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('teste@email.com');
    userId = res.body.id;
  });

  test('02 - Cadastrar usuários com campos faltando', async () => {
    const res = await request(app).post('/register').send({ nome: 'Teste' });
    expect(res.statusCode).toBe(400);
  });

  test('03 - Cadastrar usuário com email repetido', async () => {
    const res = await request(app).post('/register').send({
      nome: 'Teste',
      email: 'teste@email.com',
      senha: '1234'
    });
    expect(res.statusCode).toBe(400);
  });

  test('04 - Login', async () => {
    const res = await request(app).post('/login').send({
      email: 'teste@email.com',
      senha: '1234'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe('Teste');
  });

  test('05 - Login com senha errada', async () => {
    const res = await request(app).post('/login').send({
      email: 'teste@email.com',
      senha: '12345'
    });
    expect(res.statusCode).toBe(401);
  });

  test('06 - Login com campos ausentes', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
  });

  test('07 - Criar tarefa', async () => {
    const res = await request(app).post('/tarefas').send({
      descricao: 'Teste',
      data_prevista: '2025-12-31',
      idUsuario: userId
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.descricao).toBe('Teste');
    taskId = res.body.id;
  });

  test('08 - Criar tarefa com dados incompletos', async () => {
    const res = await request(app).post('/tarefas').send({
      descricao: 'Teste',
      idUsuario: userId
    });
    expect(res.statusCode).toBe(400);
  });

  test('09 - Criar tarefa sem definiro usuário', async () => {
    const res = await request(app).post('/tarefas').send({
      descricao: 'Teste',
      data_prevista: '2025-12-01'
    });
    expect(res.statusCode).toBe(400);
  });

  test('10 - Buscar todas as tarefas', async () => {
    const res = await request(app).get('/tarefas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('11 - Atualizar tarefa', async () => {
    const res = await request(app).put(`/tarefas/${taskId}`).send({
      descricao: 'Teste',
      data_criacao: '2025-01-01',
      data_prevista: '2025-12-31',
      data_encerramento: 'Não encerrada',
      situacao: 'Em Andamento'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/atualizada com sucesso/i);
  });

  test('12 - Atualizar tarefa inexistente', async () => {
    const res = await request(app).put(`/tarefas/999`).send({
      descricao: 'Teste',
      data_criacao: '2025-01-01',
      data_prevista: '2025-12-31',
      data_encerramento: 'Não encerrada',
      situacao: 'Em Andamento'
    });
    expect(res.statusCode).toBe(200);
  });

  test('13 - Excluir tarefa', async () => {
    const res = await request(app).delete(`/tarefas/${taskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deletada com sucesso/i);
  });

  test('14 - Excluir tarefa inexistente', async () => {
    const res = await request(app).delete(`/tarefas/9999`);
    expect(res.statusCode).toBe(200);
  });

  test('15 - Criar tarefa e verificar campo situacao padrão', async () => {
    const res = await request(app).post('/tarefas').send({
      descricao: 'Verificar situação',
      data_prevista: '2025-12-15',
      idUsuario: userId
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('situacao', 'Em Andamento');
  });  

  test('16 - Criar múltiplas tarefas', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/tarefas').send({
        descricao: `Task ${i}`,
        data_prevista: '2025-12-31',
        idUsuario: userId
      });
      expect(res.statusCode).toBe(201);
    }
  });

  test('17 - Criar tarefa e verificar formato da data', async () => {
    const res = await request(app).post('/tarefas').send({
      descricao: 'Checar data_criacao',
      data_prevista: '2025-12-20',
      idUsuario: userId
    });
    expect(res.statusCode).toBe(201);
  
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    expect(res.body.data_criacao).toMatch(regexData);
  });  

  test('18 - Criar tarefa com descrição muito longa', async () => {
    const descricaoLonga = 'A'.repeat(1000);
    const res = await request(app).post('/tarefas').send({
      descricao: descricaoLonga,
      data_prevista: '2025-12-31',
      idUsuario: userId
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.descricao.length).toBeLessThanOrEqual(1000);
  });

  test('19 - Tentar cadastrar sem JSON', async () => {
    const res = await request(app).post('/register').type('form').send('nome=A&email=b&senha=c');
    expect(res.statusCode).toBe(400);
  });

  test('20 - Atualizar tarefa sem corpo', async () => {
    const res = await request(app).put('/tarefas/1').send({});
    expect(res.statusCode).toBe(400);
  });

  afterAll(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });
  
});
