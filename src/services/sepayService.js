const SEPAY_MERCHANT_ID = import.meta.env.VITE_SEPAY_MERCHANT_ID || '';
const SEPAY_SECRET_KEY = import.meta.env.VITE_SEPAY_SECRET_KEY || '';

// Sandbox URLs
const SEPAY_CHECKOUT_URL = 'https://pay-sandbox.sepay.vn/v1/checkout/init';
const SEPAY_API_URL = 'https://pgapi-sandbox.sepay.vn';

// ===== HMAC-SHA256 SIGNATURE =====
async function hmacSHA256(secret, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== TẠO CHECKOUT FORM FIELDS =====
export async function createSepayCheckout({
  amount,
  orderId,
  description = 'Thanh toan STULance',
  successUrl = `${window.location.origin}/payment/return?status=success`,
  errorUrl = `${window.location.origin}/payment/return?status=error`,
  cancelUrl = `${window.location.origin}/payment/return?status=cancel`,
  paymentMethod = 'BANK_TRANSFER',
  customerId = '',
  customData = ''
}) {
  // Build fields object (order matters for signature)
  const fields = {
    merchant: SEPAY_MERCHANT_ID,
    operation: 'PURCHASE',
    payment_method: paymentMethod,
    order_invoice_number: orderId,
    order_amount: String(amount),
    currency: 'VND',
    order_description: description,
    customer_id: customerId,
    success_url: successUrl,
    error_url: errorUrl,
    cancel_url: cancelUrl,
    custom_data: customData
  };

  // Build signing string: field1=value1&field2=value2&... (alphabetical order)
  const sortedKeys = Object.keys(fields).sort();
  const signingString = sortedKeys
    .filter(k => fields[k] !== '' && fields[k] !== null && fields[k] !== undefined)
    .map(k => `${k}=${fields[k]}`)
    .join('&');

  const signature = await hmacSHA256(SEPAY_SECRET_KEY, signingString);

  return { ...fields, signature };
}

// ===== SUBMIT CHECKOUT (Tạo form HTML) =====
export function generateCheckoutForm(fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = SEPAY_CHECKOUT_URL;
  form.style.display = 'none';

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

// ===== THANH TOÁN QRCODE (Tạo link redirect) =====
export function getSepayCheckoutUrl(fields) {
  const params = new URLSearchParams(fields);
  return `${SEPAY_CHECKOUT_URL}?${params.toString()}`;
}

// ===== MOCK IPN (Giả lập callback cho sandbox) =====
export function simulateIPN(orderId, amount) {
  return {
    timestamp: Math.floor(Date.now() / 1000),
    notification_type: 'ORDER_PAID',
    order: {
      id: crypto.randomUUID(),
      order_id: orderId,
      order_status: 'CAPTURED',
      order_currency: 'VND',
      order_amount: String(amount),
      order_invoice_number: orderId,
      custom_data: [],
      order_description: 'Simulated payment'
    },
    transaction: {
      id: crypto.randomUUID(),
      payment_method: 'BANK_TRANSFER',
      transaction_id: Date.now().toString(16),
      transaction_type: 'PAYMENT',
      transaction_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      transaction_status: 'APPROVED',
      transaction_amount: String(amount),
      transaction_currency: 'VND',
      authentication_status: 'AUTHENTICATION_SUCCESSFUL'
    }
  };
}

// ===== CHECK ORDER STATUS (REST API) =====
export async function checkOrderStatus(invoiceNumber) {
  const auth = btoa(`${SEPAY_MERCHANT_ID}:${SEPAY_SECRET_KEY}`);

  const response = await fetch(`${SEPAY_API_URL}/v1/orders/${invoiceNumber}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `SePay API Error: ${response.status}`);
  }

  return await response.json();
}

// ===== LIST TRANSACTIONS =====
export async function listTransactions({ perPage = 20, page = 1, status = '' } = {}) {
  const auth = btoa(`${SEPAY_MERCHANT_ID}:${SEPAY_SECRET_KEY}`);
  const params = new URLSearchParams({ per_page: perPage, page });
  if (status) params.append('transaction_status', status);

  const response = await fetch(`${SEPAY_API_URL}/v1/transactions?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error(`SePay API Error: ${response.status}`);
  return await response.json();
}

export default {
  createSepayCheckout,
  generateCheckoutForm,
  getSepayCheckoutUrl,
  simulateIPN,
  checkOrderStatus,
  listTransactions
};
