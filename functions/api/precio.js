// Inductoria · Cloudflare Pages Function: /api/precio
// -------------------------------------------------------
// Intermediario entre la landing y Supabase. La landing llama a esta
// ruta propia (mismo dominio, sin key visible), y esta función es la
// que efectivamente llama a Supabase con la anon key, que vive como
// variable de entorno en Cloudflare (Settings > Environment variables),
// nunca en el HTML ni en el bundle que baja al navegador.

export async function onRequestGet(context) {
  const { env } = context;

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
