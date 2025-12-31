const jwt = require('jsonwebtoken');
const JWT_SECRET = 'segredo_super_secreto_railspot'; // Tem de ser igual ao do authController

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Se não tiver token, expulsa
  if (!token) {
    return res.status(401).json({ error: 'Sem token, acesso negado' });
  }

  // Se tiver, verifica se é válido
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guarda os dados do user no pedido
    
    // ATENÇÃO: Se tiveres guardado o nome no token no login, ótimo.
    // Se não, aqui terias de ir buscar o nome à BD.
    // Para simplificar, vamos assumir que o frontend envia o nome ou vamos buscar à BD.
    // Como no passo anterior do Login guardámos {id}, vamos precisar de ir buscar o nome.
    // Mas espera... no AuthController.js nós fizemos jwt.sign({ id: ... }).
    
    // Vamos fazer um ajuste rápido: O controlador vai buscar o nome à BD se necessário,
    // ou então simplificamos e assumimos que o token é válido.
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};