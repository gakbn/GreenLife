const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { method, headers, body } = req;
  const apiUrl = `http://74.208.44.191:3004${req.url}`;

  try {
    const response = await fetch(apiUrl, {
      method,
      headers: {
        ...headers,
        'Authorization': `Bearer Gr33nL1f3#cgm#`, // Tu token de autorización
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con la API' });
  }
};