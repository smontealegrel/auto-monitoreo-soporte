// Genera un access token de reproducción para streams de América TV (Closed Access)
// Uso: node get-access-token-americatv.js <stream_id>
// Ejemplo: node get-access-token-americatv.js 69bae703d0d195b624e5315b

require('dotenv').config();
const axios = require('axios');

const id    = process.argv[2];
const token = process.env.AMERICATV_TOKEN_MS;

if (!id) {
  console.error('❌  Falta el ID del stream.\n   Uso: node get-access-token-americatv.js <stream_id>');
  process.exit(1);
}
if (!token) {
  console.error('❌  No hay AMERICATV_TOKEN_MS en el .env');
  process.exit(1);
}

(async () => {
  try {
    console.log(`\n🔑  Generando access token para stream: ${id} ...\n`);
    const { data } = await axios.post(
      `https://platform.mediastre.am/api/access/issue?id=${id}&type=live&time_limit=3600&validation_lock=3600`,
      {},
      { headers: { 'X-API-Token': token }, timeout: 10000 }
    );

    const result = data.data !== undefined ? data.data : data;
    const accessToken = result.token || result.access_token || result;

    console.log('✅  Token generado:\n');
    console.log(`   ${accessToken}\n`);
    console.log('👉  Pégalo en el input "🔑 Access token" del slot correspondiente.\n');
  } catch (e) {
    console.error('❌  Error:', e.response?.data || e.message);
    process.exit(1);
  }
})();
