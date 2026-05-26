import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private config: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = this.config.get('email', {});

    if (process.env.NODE_ENV === 'development' || !emailConfig.host) {
      // Development: use ethereal (catch-all email service)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'your-ethereal-user@ethereal.email',
          pass: 'your-ethereal-password',
        },
      });
    } else {
      // Production: use configured SMTP
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port || 587,
        secure: emailConfig.secure || false,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
      });
    }
  }

  async sendLeadCreatedEmail(
    to: string,
    leadTitle: string,
    organizationName: string,
  ): Promise<void> {
    const subject = `New Lead Created: ${leadTitle}`;
    const html = this.renderLeadCreatedTemplate(leadTitle, organizationName);

    try {
      await this.transporter.sendMail({
        from: this.config.get('email.from', 'noreply@leadflow.local'),
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private renderLeadCreatedTemplate(
    leadTitle: string,
    orgName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Lead Created</h1>
            </div>
            <div class="content">
              <p>Hi,</p>
              <p>A new lead has been created in <strong>${orgName}</strong>:</p>
              <h2>${leadTitle}</h2>
              <p>Access your LeadFlow dashboard to view more details and manage this lead.</p>
              <a href="http://localhost:4200/leads" class="button">View Lead</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
