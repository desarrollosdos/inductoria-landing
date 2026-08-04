// Inductoria landing · Worker principal
// -----------------------------------------
// En el modelo "Worker con static assets" de Cloudflare, este es el único
// punto de entrada: decide si la petición es para /api/precio o /api/visita
// (las maneja acá mismo, llamando a Supabase) o si es cualquier otra URL,
// en cuyo caso la deja pasar tal cual al servidor de archivos estáticos
// (env.ASSETS), que es quien sirve el index.html y el resto del sitio.
//
// La URL y la anon key de Supabase están escritas acá abajo directamente
// (no como variable de entorno de Cloudflare). Es seguro: este archivo
// corre del lado del servidor, nunca se descarga al navegador ni queda
// visible en el HTML. Evita depender de la pantalla de variables de
// Cloudflare, que dio problemas de configuración más de una vez.

const SUPABASE_URL = 'https://vclvzpdopjybzlzukttp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbHZ6cGRvcGp5YnpsenVrdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MjQ1NTMsImV4cCI6MjEwMTAwMDU1M30.zxzTkKi46o7QuaRiP64lAMvZNMREQ-NoEYJ4M3E_LOc';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/precio') {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/precio-publico`, {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'No se pudo obtener el precio' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (url.pathname === '/api/visita' && request.method === 'POST') {
      try {
        const body = await request.text();
        const res = await fetch(`${SUPABASE_URL}/functions/v1/registrar-visita`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: body || '{}',
        });
        const data = await res.text();
        return new Response(JSON.stringify({ ok: res.ok, status: res.status, data }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: String(err) }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
