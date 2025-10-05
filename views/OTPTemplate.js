export function otpTemplate(otpCode) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>DSCart OTP Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background-color: #fff9f2;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 10px;
          padding: 25px;
          border: 1px solid #f0e6da;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #ff7b00;
          padding-bottom: 15px;
        }
        .header h2 {
          margin: 0;
          color: #ff7b00;
          font-size: 24px;
        }
        .content {
          text-align: center;
          padding: 25px 0;
        }
        .content p {
          color: #333;
          font-size: 16px;
          line-height: 1.6;
        }
        .otp {
          display: inline-block;
          font-size: 26px;
          font-weight: bold;
          color: #ffffff;
          background: #ff7b00;
          padding: 14px 28px;
          border-radius: 8px;
          letter-spacing: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #888;
          border-top: 1px solid #f0e6da;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>DSCart Verification</h2>
        </div>
        <div class="content">
          <p>Hello Foodie 🍴,</p>
          <p>Use the following One-Time Password (OTP) to verify your DSCart account or complete your order:</p>
          <div class="otp">${otpCode}</div>
          <p>Please do not share it with anyone.</p>
        </div>
        <div class="footer">
          <p>© 2025 DSCart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }
  