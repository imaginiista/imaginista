import { MercadoPagoConfig, Preference } from 'mercadopago';

// ⚠️ COLE SEU ACCESS TOKEN AQUI (Aquele que começa com TEST-42...)
const client = new MercadoPagoConfig({ accessToken: 'TEST-3daebd00-74f2-4cd1-a114-91a4b6b3591c' });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    // Cria a preferência de pagamento
    const preference = new Preference(client);
    
    const body = {
      items: items.map(item => ({
        title: item.name,
        unit_price: Number(item.price),
        quantity: 1,
        currency_id: 'BRL',
      })),
      back_urls: {
        success: 'https://oimaginista.com/sadak/', // Para onde volta se der certo
        failure: 'https://oimaginista.com/sadak/',
        pending: 'https://oimaginista.com/sadak/',
      },
      auto_return: 'approved',
    };

    const result = await preference.create({ body });

    // Retorna o Link de Pagamento (init_point)
    res.status(200).json({ url: result.init_point });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
}