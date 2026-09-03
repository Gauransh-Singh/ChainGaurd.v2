const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
  // Global CORS Middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, odata-version, x-csrf-token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
});

cds.on('loaded', async (model) => {
  try {
    const db = await cds.connect.to('db');
    await cds.deploy(model).to(db);
    console.log('✅ CDS Schema & CSV Data automatically deployed and seeded into DB');
  } catch (err) {
    console.error('Database auto-deploy warning:', err.message);
  }
});

cds.on('listening', ({ server, url }) => {
  console.log(`🚀 SAP CAP Service is LIVE at: ${url}`);
  console.log(`📦 OData Service Endpoint: ${url}chain-guard/`);
});

module.exports = cds.server;
