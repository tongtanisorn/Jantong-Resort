import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export async function POST(request) {
  const { amount, bookingId } = await request.json();
  const promptPayId = process.env.PROMPTPAY_ID || process.env.NEXT_PUBLIC_PROMPTPAY_ID || "0927670303";
  const depositAmount = Number(amount);

  if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
    return Response.json({ error: "Invalid deposit amount" }, { status: 400 });
  }

  const payload = generatePayload(promptPayId, { amount: depositAmount });
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320
  });

  return Response.json({
    bookingId,
    amount: depositAmount,
    promptPayId,
    qrDataUrl
  });
}
