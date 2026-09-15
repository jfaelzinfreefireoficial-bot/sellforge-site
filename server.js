// 💰 SellForge Financeiro — Backend Seguro
// 🔒 Variável de ambiente: MP_ACCESS_TOKEN

require('dotenv').config();
const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 Carrega da variável de ambiente — NUNCA coloque a chave aqui!
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error('❌ ERRO: MP_ACCESS_TOKEN não configurada!');
  process.exit(1);
}

mercadopago.configure({ access_token: MP_ACCESS_TOKEN });

// ✅ Rota para criar pagamento Pix + QR Code
app.post('/criar-pagamento', async (req, res) => {
  try {
    const { valor, descricao, email } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: 'Valor inválido' });
    }

    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: descricao || 'Pagamento SellForge Financeiro',
      payment_method_id: 'pix',
      payer: { email: email || 'cliente@sellforge.com.br' }
    });

    const txData = pagamento.body.point_of_interaction?.transaction_data || {};
    
    res.json({
      sucesso: true,
      id: pagamento.body.id,
      status: pagamento.body.status,
      qr_code: txData.qr_code,
      qr_code_base64: txData.qr_code_base64,
      ticket_url: txData.ticket_url
    });

  } catch (erro) {
    console.error('Erro Mercado Pago:', erro);
    res.status(500).json({ sucesso: false, erro: 'Erro ao criar pagamento' });
  }
});

// ✅ Rota de teste
app.get('/', (req, res) => {
  res.send('✅ SellForge Backend Online — Mercado Pago integrado!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));