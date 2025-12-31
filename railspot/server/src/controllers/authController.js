const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Segredo para assinar os tokens (num projeto real, isto estaria no .env)
const JWT_SECRET = 'segredo_super_secreto_railspot'; 

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Verificar se o utilizador já existe
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está registado.' });
    }

    // 2. Encriptar a password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Guardar na Base de Dados
    // ALTERAÇÃO AQUI: Adicionei "is_admin" ao RETURNING para o frontend saber logo
    const newUser = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin',
      [name, email, passwordHash]
    );

    // 4. Gerar o Token
    const token = jwt.sign({ id: newUser.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: newUser.rows[0] });

  } catch (error) {
    console.error('Erro no registo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Procurar o utilizador
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Email ou password incorretos.' });
    }

    // 2. Comparar a password
    const validPass = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPass) {
      return res.status(400).json({ error: 'Email ou password incorretos.' });
    }

    // 3. Gerar Token
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

    // Enviar dados
    // --- ALTERAÇÃO IMPORTANTE AQUI ---
    // Agora enviamos o "is_admin" para o React saber se mostra o botão verde
    res.json({ 
        token, 
        user: { 
            id: user.rows[0].id, 
            name: user.rows[0].name, 
            email: user.rows[0].email,
            is_admin: user.rows[0].is_admin // <--- O SEGREDO ESTÁ AQUI
        } 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};