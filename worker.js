// Inductoria landing · Worker principal
// -----------------------------------------
// En el modelo "Worker con static assets" de Cloudflare, este es el único
// punto de entrada: decide si la petición es para /api/precio (la maneja
// acá mismo, llamando a Supabase con la key que vive en las variables de
// entorno de Cloudflare) o si es cualquier otra URL, en cuyo caso la deja
// pasar tal cual al servidor de archivos estáticos (env.ASSETS), que es
// quien sirve el index.html y el resto del sitio.
 
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
 
    if (url.pathname === '/api/precio') {
      try {
        const res = await fetch(`${env.SUPABASE_URL}/functions/v1/precio-publico`, {
          headers: {
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            apikey: env.SUPABASE_ANON_KEY,
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
        const res = await fetch(`${env.SUPABASE_URL}/functions/v1/registrar-visita`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
            apikey: env.SUPABASE_ANON_KEY,
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
 
