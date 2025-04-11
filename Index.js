const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Cliente Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware para aceitar JSON
app.use(express.json());

// Página inicial (HTML)
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, 'utf8', (err, html) => {
    if (err) {
      res.status(500).send('Erro ao carregar o HTML');
      return;
    }
    res.send(html);
  });
});

// Listar frentes ativas
app.get('/sentinela/frentes', async (req, res) => {
  const { data, error } = await supabase
    .from('frentes_ativas')
    .select('nome, tipo, status, receita_direta');

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  const resposta = data.map((frente) => ({
    nome: frente.nome,
    tipo: frente.tipo,
    status: frente.status,
    receita_direta: frente.receita_direta
  }));

  res.status(200).json(resposta);
});

// Criar nova frente
app.post('/nova-frente', async (req, res) => {
  const { nome, tipo, status, descricao, receita_direta } = req.body;

  const { data, error } = await supabase
    .from('frentes_ativas')
    .insert([
      {
        nome,
        tipo,
        status,
        descricao,
        receita_direta
      }
    ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ sucesso: true, frente: data });
});

// Atualizar frente existente
app.post('/atualizar-frente', async (req, res) => {
  const { id, atualizacao } = req.body;

  const { data, error } = await supabase
    .from('frentes_ativas')
    .update(atualizacao)
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Inicia servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
