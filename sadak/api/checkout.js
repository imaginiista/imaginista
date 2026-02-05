// Arquivo: api/checkout.js
// Esse código roda no servidor seguro da Vercel, longe dos olhos do usuário.

import { MercadoPagoConfig, Preference } from 'mercadopago';

// ⚠️ AQUI VAI O SEU ACCESS TOKEN (A CHAVE SECRETA)
// O ideal é usar variáveis de ambiente, mas para teste pode colar aqui entre aspas.
const client = new MercadoPagoConfig({ accessToken: 'SEU_ACCESS_TOKEN_AQUI' });

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { items } = req.body; // Recebe o carrinho do site

    // Cria a estrutura que o Mercado Pago exige
    const preference = new Preference(client);
    
    const body = {
      items: items.map(item => ({
        title: item.name,
        unit_price: Number(item.price),
        quantity: 1, // Ou a quantidade real se tiver
        currency_id: 'BRL',
      })),
      back_urls: {
        success: 'https://seusite.com/sucesso', // Onde o cliente volta após pagar
        failure: 'https://seusite.com/erro',
        pending: 'https://seusite.com/pendente',
      },
      auto_return: 'approved',
    };

    const result = await preference.create({ body });

    // Devolve o Link de Pagamento para o site
    res.status(200).json({ url: result.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
}