import config from "../config";

interface ContactUsReplyEmailData {
    name: string;
    email: string;
    subject: string;
    message: string;
    reply: string;
}

const contactUsReplyTemplate = (data: ContactUsReplyEmailData): string => `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 640px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            overflow: hidden;
          }
          .header {
            background-color: #343a40;
            color: #ffffff;
            padding: 24px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
          }
          .section {
            padding: 24px;
            border-bottom: 1px solid #e0e0e0;
          }
          .section h2 {
            font-size: 18px;
            margin-bottom: 8px;
            color: #333;
          }
          .section p {
            font-size: 15px;
            margin: 4px 0;
            color: #555;
          }
          .highlight-box {
            background-color: #f8f9fa;
            padding: 16px;
            border-left: 4px solid #17a2b8;
            font-size: 14px;
            margin-top: 10px;
            white-space: pre-line;
          }
          .admin-reply {
            border-left-color: #28a745;
          }
          .footer {
            background-color: #f7f7f7;
            text-align: center;
            padding: 16px;
            font-size: 13px;
            color: #999;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Response to Your Support Message</h1>
          </div>
  
          <div class="section">
            <h2>User Details</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
          </div>
  
          <div class="section">
            <h2>Your Message</h2>
            <div class="highlight-box">${data.message}</div>
          </div>
  
          <div class="section">
            <h2>Admin's Reply</h2>
            <div class="highlight-box admin-reply">${data.reply}</div>
          </div>
  
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${config.app_name} Website. All rights reserved.<br />
            <a href="https://matchmaker.com/contact">Contact Support</a> | 
            <a href="https://matchmaker.com/terms-condition">Privacy Policy</a>
          </div>
        </div>
      </body>
    </html>
  `;

export { contactUsReplyTemplate };
