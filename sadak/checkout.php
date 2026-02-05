<?php
// Arquivo: checkout.php

// 1. Configuração
// ⚠️ COLE SEU ACCESS TOKEN AQUI (Mantenha as aspas)
$access_token = 'TEST-4208404900050443-020504-27ecbb02f4c3eec540d80923593dc8df-120720214';

header('Content-Type: application/json');

// Verifica se é um POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Pega os dados do carrinho enviados pelo HTML
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['items']) || empty($data['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Carrinho vazio']);
    exit;
}

// 2. Monta a estrutura para o Mercado Pago
$items_mp = [];
foreach ($data['items'] as $item) {
    $items_mp[] = [
        'title' => $item['name'] . ' (Tam: ' . $item['size'] . ')',
        'quantity' => 1,
        'currency_id' => 'BRL',
        'unit_price' => (float)$item['price']
    ];
}

$preference_data = [
    'items' => $items_mp,
    'back_urls' => [
        'success' => 'https://oimaginista.com/sadak/',
        'failure' => 'https://oimaginista.com/sadak/',
        'pending' => 'https://oimaginista.com/sadak/'
    ],
    'auto_return' => 'approved'
];

// 3. Envia para o Mercado Pago (Sem precisar de SDK instalado)
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => 'https://api.mercadopago.com/checkout/preferences',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => json_encode($preference_data),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $access_token
    ],
]);

$response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// 4. Devolve o link para o site
if ($http_code == 201 || $http_code == 200) {
    $mp_response = json_decode($response, true);
    // Para teste (Sandbox), usamos o init_point. Em produção também.
    // Se quiser forçar teste use: $mp_response['sandbox_init_point']
    echo json_encode(['url' => $mp_response['init_point']]); 
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro MP: ' . $response]);
}
?>