export const templateForgotPassword = (resetLink: string, userName: string) => {
  return `
    <!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 0;">
    <tr><td align="center">
      <table width="580" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:20px 24px;background:#e11d48;color:#fff;font-weight:700;">Yêu cầu đặt lại mật khẩu</td></tr>
        <tr><td style="padding:20px;color:#111;">
          
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tạo mật khẩu mới (hết hạn sau 15 phút):</p>

          <p style="text-align:center;margin:20px 0;">
            <a href="${resetLink}" style="padding:12px 20px;border-radius:6px;background:#e11d48;color:#fff;text-decoration:none;font-weight:600;">Đặt lại mật khẩu</a>
          </p>

          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          <p>${resetLink}</p>

          <p>Trân trọng,<br/>[TÊN SHOP]</p>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `;
};
