import { Request, Response } from "express";
import crypto from "crypto";
import axios from "axios";

const {
  MOMO_PARTNER_CODE = "MOMO",
  MOMO_ACCESS_KEY = "",
  MOMO_SECRET_KEY = "",
  MOMO_REDIRECT_URL = "http://localhost/api/client/payment/momo/redirect",
  MOMO_IPN_URL = "http://localhost/api/client/payment/momo/callback",
  MOMO_FRONTEND_URL = "http://localhost:3000/payment-success",
  ORDER_SERVICE_URL = "http://order:5004",
} = process.env;

interface MomoCreateResponse {
  payUrl: string;
  resultCode: number;
  message: string;
}

// =====================================================================
// 1. Tạo thanh toán MoMo
// =====================================================================
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { amount, orderId } = req.body;
    console.log("Đã chạy vào hàm createPayment", amount, orderId);

    if (!amount || !orderId) {
      return res.status(400).json({ message: "amount và orderId là bắt buộc" });
    }

    const intAmount = Math.round(Number(amount));
    const requestId = MOMO_PARTNER_CODE + new Date().getTime();
    const momoOrderId = requestId;
    const orderInfo = `Thanh toán đơn hàng #${orderId}`;
    const requestType = "captureWallet";
    const extraData = Buffer.from(JSON.stringify({ orderId })).toString("base64");

    const rawSignature =
      "accessKey=" + MOMO_ACCESS_KEY +
      "&amount=" + intAmount +
      "&extraData=" + extraData +
      "&ipnUrl=" + MOMO_IPN_URL +
      "&orderId=" + momoOrderId +
      "&orderInfo=" + orderInfo +
      "&partnerCode=" + MOMO_PARTNER_CODE +
      "&redirectUrl=" + MOMO_REDIRECT_URL +
      "&requestId=" + requestId +
      "&requestType=" + requestType;

    const signature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId,
      amount: intAmount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl: MOMO_REDIRECT_URL,
      ipnUrl: MOMO_IPN_URL,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const { data: momoResponse } = await axios.post<MomoCreateResponse>(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
      { headers: { "Content-Type": "application/json" } },
    );

    if (momoResponse.resultCode !== 0) {
      return res.status(400).json({
        message: momoResponse.message || "Tạo thanh toán MoMo thất bại",
      });
    }
    console.log("Đã thực hiện xong hàm createPayment", momoResponse.payUrl);

    return res.json({ payUrl: momoResponse.payUrl });
  } catch (error: unknown) {
    const err = error as { response?: { data: unknown }; message?: string };
    console.error("MoMo createPayment error:", err.response?.data || err.message);
    return res.status(500).json({ message: "Tạo thanh toán thất bại" });
  }
};

// =====================================================================
// 2. Redirect handler — MoMo redirect trình duyệt về đây sau thanh toán
//    Flow: MoMo → browser → GET /redirect?... → verify → update order → redirect frontend
// =====================================================================
export const momoRedirect = async (req: Request, res: Response) => {
  try {
    const {
      partnerCode, orderId, requestId, amount, orderInfo, orderType, transId,
      resultCode, message, payType, responseTime, extraData, signature,
    } = req.query as Record<string, string>;

    // Verify signature từ MoMo
    const rawSignature =
      "accessKey=" + MOMO_ACCESS_KEY +
      "&amount=" + amount +
      "&extraData=" + extraData +
      "&message=" + message +
      "&orderId=" + orderId +
      "&orderInfo=" + orderInfo +
      "&orderType=" + orderType +
      "&partnerCode=" + partnerCode +
      "&payType=" + payType +
      "&requestId=" + requestId +
      "&responseTime=" + responseTime +
      "&resultCode=" + resultCode +
      "&transId=" + transId;

    const expectedSignature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    const isValidSignature = expectedSignature === signature;
    const resultCodeInt = Number(resultCode);

    let paymentStatus = "failed"; 
    if (resultCodeInt === 0) {
      paymentStatus = "paid";
    }

    // Nếu signature hợp lệ → update order status (cả thành công lẫn thất bại)
    if (isValidSignature && extraData) {
      try {
        const decoded = JSON.parse(Buffer.from(extraData, "base64").toString());
        const realOrderId = decoded.orderId;
        
        if (realOrderId) {
          await axios.post(
            `${ORDER_SERVICE_URL}/internal/order/${realOrderId}/payment-status`,
            { paymentStatus, paymentId: transId, message } // Gửi thêm message để order service ghi log nếu cần
          );
          console.log(`[MoMo Redirect] Order ${realOrderId} updated to ${paymentStatus.toUpperCase()}`);
        }
      } catch (updateErr: unknown) {
        const err = updateErr as { response?: { data: unknown }; message?: string };
        console.error("[MoMo Redirect] Update order failed:", err.response?.data || err.message);
      }
    }

    // Build query string để forward sang frontend (giữ nguyên của bạn)
    const params = new URLSearchParams({
      resultCode: resultCode ?? "",
      message: message ?? "",
      amount: amount ?? "",
      transId: transId ?? "",
      extraData: extraData ?? "",
      payType: payType ?? "",
    });

    return res.redirect(`${MOMO_FRONTEND_URL}?${params.toString()}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[MoMo Redirect] Error:", err.message);
    return res.redirect(`${MOMO_FRONTEND_URL}?resultCode=99&message=Lỗi hệ thống`);
  }
};
// =====================================================================
// 3. IPN Callback — MoMo server gọi trực tiếp (chỉ hoạt động khi có public URL)
//    Dùng như backup, production sẽ hoạt động đầy đủ
// =====================================================================
export const momoCallback = async (req: Request, res: Response) => {
  try {
    const { resultCode, extraData, transId, orderId: momoOrderId, message } = req.body;
    const resultCodeInt = Number(resultCode);

    console.log("[MoMo IPN]", { resultCode, momoOrderId, transId });

    let paymentStatus = "failed";
    if (resultCodeInt === 0) {
      paymentStatus = "paid";
    }

    if (extraData) {
      try {
        const decoded = JSON.parse(Buffer.from(extraData, "base64").toString());
        const realOrderId = decoded.orderId;

        if (realOrderId) {
          await axios.post(
            `${ORDER_SERVICE_URL}/internal/order/${realOrderId}/payment-status`,
            { paymentStatus, paymentId: String(transId), message }
          );
          console.log(`[MoMo IPN] Order ${realOrderId} updated to ${paymentStatus.toUpperCase()}`);
        }
      } catch (updateErr: unknown) {
        const err = updateErr as { response?: { data: unknown }; message?: string };
        console.error("[MoMo IPN] Update order failed:", err.response?.data || err.message);
      }
    }

    // Luôn trả về 200 OK cho MoMo
    return res.status(200).json({ message: "received" });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[MoMo IPN] Error:", err.message);
    return res.status(200).json({ message: "received" });
  }
};