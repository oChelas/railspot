const db = require('../config/db');

exports.exportBackup = async (req, res) => {
  try {
    // Vamos buscar todos os dados de todas as tabelas
    const users = await db.query('SELECT * FROM users');
    const stations = await db.query('SELECT * FROM stations');
    const reviews = await db.query('SELECT * FROM reviews');
    const occurrences = await db.query('SELECT * FROM occurrences');

    // Estruturamos o ficheiro de backup
    const backupData = {
      railspot_version: "1.0",
      export_date: new Date().toISOString(),
      data: {
        users: users.rows,
        stations: stations.rows,
        reviews: reviews.rows,
        occurrences: occurrences.rows
      }
    };

    // Estes cabeçalhos (Headers) são o truque para forçar o download em vez de mostrar texto no browser
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=railspot_backup_' + Date.now() + '.json');
    
    // Enviamos o ficheiro estruturado com espaçamento de 2 para ficar legível
    res.send(JSON.stringify(backupData, null, 2));

  } catch (error) {
    console.error('Erro ao gerar cópia de segurança:', error);
    res.status(500).json({ error: 'Erro ao gerar backup da base de dados.' });
  }
};