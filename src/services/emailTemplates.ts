export const EMAIL_TEMPLATES: Record<string, { subject: string; body: string; enabled: boolean }> = {
  booking_pending: { 
    subject: "Booking Pending - {{tourTitle}}", 
    body: "Thank you for booking {{tourTitle}}! Your booking status now is <strong>Pending</strong> until we verify your payment. Once your receipt is validated, your status will be updated to confirmed.{{supplierInfo}}", 
    enabled: true 
  },
  booking_confirmed: { 
    subject: "Booking Confirmed! - {{tourTitle}}", 
    body: "Great news! Your booking for {{tourTitle}} with Bali Adventours is confirmed. We can't wait to show you the best of Bali!{{supplierInfo}}{{supplierContactConfirmed}}", 
    enabled: true 
  },
  booking_status_confirmed: {
    subject: "Booking Confirmed! - {{tourTitle}}",
    body: "Great news! Your booking status for {{tourTitle}} has been updated from Pending to <strong>Confirmed</strong>. Below are your travel details and ticket voucher.{{supplierInfo}}{{supplierContactConfirmed}}",
    enabled: true
  },
  booking_change_request: {
    subject: "Booking Change Request Submitted - #{{bookingId}}",
    body: "We have received your requested changes (date, participants, and/or add-ons) for your tour {{tourTitle}}. Your booking status is currently <strong>Review Required</strong> while our team validates schedule and guide availability. We will notify you once approved!{{supplierInfo}}",
    enabled: true
  },
  booking_change_approved: {
    subject: "Booking Request Approved! - #{{bookingId}}",
    body: "Your booking change request for {{tourTitle}} has been successfully approved! Please find your updated itinerary below.{{supplierInfo}}{{supplierContactConfirmed}}",
    enabled: true
  },
  booking_cancellation_request: {
    subject: "Booking Cancellation Request - #{{bookingId}}",
    body: "Your cancellation request for {{tourTitle}} has been registered. Our team is currently reviewing the request in accordance with our terms of service, and we'll follow up shortly.{{supplierInfo}}",
    enabled: true
  },
  booking_cancelled: { 
    subject: "Booking Cancelled - #{{bookingId}}", 
    body: `We wanted to let you know that your booking has been successfully cancelled.<br><br>If you’ve already made a payment, any applicable refund will be processed according to our cancellation policy. You’ll receive a separate confirmation once the refund has been completed.<br><br>We understand that plans can change. If you’d like to reschedule your tour or explore other options, we’d be happy to help.<br><br>You can:<br>• Reply directly to this email<br>• Contact us on WhatsApp: <a href='{{whatsappLink}}' style='color: #0055ff; text-decoration: underline;'>{{supportPhone}}</a><br><br>We hope to welcome you on another tour soon.<br><br>Warm regards,<br>{{siteName}}<br>{{appUrl}}`,
    enabled: true
  },
  guide_assigned: { 
    subject: "Your Guide is Assigned! - {{tourTitle}}", 
    body: "We've assigned a guide for your upcoming tour! You can see your guide's details below and contact them directly via WhatsApp for any further discussion.", 
    enabled: true 
  },
  tour_completed_review_request: {
    subject: "Tour Completed! Thank You and Share Your Experience! - {{tourTitle}}",
    body: "Thank you for completing your tour with {{siteName}}! We hope you had a spectacular adventure. Your feedback means everything to us. Please take 1 minute to leave us your reviews and rate your experience! Thank you again!{{supplierInfo}}",
    enabled: true
  },

  // ADMIN Notification Templates
  admin_new_booking: { 
    subject: "[Admin] New Booking Alert: #{{bookingId}} - {{tourTitle}}", 
    body: "<strong>New Booking Alert!</strong><br><br>A new booking has been logged on the platform.<br><br>Status: <strong>{{status}}</strong><br>Lead Guest: {{customerName}} (Nationality: {{nationality}}, Phone: {{phone}})<br><br>{{supplierInfo}}<br><br><strong>Admin Financial Breakdown:</strong><br>Total Amount Paid: {{totalAmount}}<br>Supplier Commission: ({{commissionRate}}%) {{supplierCommission}}<br>Supplier Net Earnings: {{supplierEarnings}}", 
    enabled: true 
  },
  admin_booking_confirmed: {
    subject: "[Admin] Booking Confirmed: #{{bookingId}}",
    body: "<strong>Booking Confirmed by Admin</strong><br><br>Booking Reference #{{bookingId}} has been successfully updated to <strong>Confirmed</strong>.<br><br><strong>Details:</strong><br>Lead Guest: {{customerName}}<br>Tour: {{tourTitle}}<br>Operator Partner: {{supplierName}}<br><br>The client has been notified.",
    enabled: true
  },
  admin_booking_change_request: {
    subject: "[Admin] New Booking Change Request: #{{bookingId}}",
    body: "<strong>Booking Change Request Received</strong><br><br>Customer {{customerName}} has proposed an update to Booking #{{bookingId}} (Date, Participants, or Add-ons).<br><br><strong>Proposed Tour Details:</strong><br>Tour: {{tourTitle}}<br>New Date: {{date}}<br>New Time: {{time}}<br>New Total: {{totalAmount}}<br><br>Please check the admin console dashboard to review and approve these changes.",
    enabled: true
  },
  admin_booking_change_approved: {
    subject: "[Admin] Booking Change Approved: #{{bookingId}}",
    body: "<strong>Booking Change Approved</strong><br><br>Proposed modifications for booking #{{bookingId}} have been successfully approved and confirmed in the database.",
    enabled: true
  },
  admin_booking_cancellation_request: {
    subject: "[Admin] Booking Cancellation Request: #{{bookingId}}",
    body: "<strong>Booking Cancellation Request Received</strong><br><br>Lead Guest {{customerName}} has requested a cancellation for Booking #{{bookingId}}.<br><br>Please review and confirm this request via the Admin console dashboard.",
    enabled: true
  },
  admin_booking_cancellation_approved: {
    subject: "[Admin] Booking Cancellation Approved: #{{bookingId}}",
    body: "<strong>Booking Cancellation Approved</strong><br><br>Cancellation for booking #{{bookingId}} has been approved by the Admin and the supplier has been notified.",
    enabled: true
  },
  admin_booking_completed: {
    subject: "[Admin] Tour Booking Completed: #{{bookingId}}",
    body: "<strong>Booking Tour Completed Successfully</strong><br><br>Booking Reference #{{bookingId}} ({{tourTitle}}) has been completed.",
    enabled: true
  },

  // SUPPLIER Notification Templates
  supplier_new_booking: { 
    subject: "[Supplier] New Booking Notification: #{{bookingId}} - {{tourTitle}}", 
    body: "Hello {{supplierName}},<br><br>You have received a new booking for your tour '{{tourTitle}}'. Please review the booking summary below and prepare for the passenger's arrival.<br><br><strong>Booking Summary:</strong><br>Reference: #{{bookingId}}<br>Customer: {{customerName}}<br>Date: {{date}}<br>Guests: {{guests}}<br><br><strong>Financial Details:</strong><br>Total Customer Paid: {{totalAmount}}<br>Commission to pay: ({{commissionRate}}%) {{supplierCommission}}<br>Net earnings you will receive: {{supplierEarnings}}", 
    enabled: true 
  },
  supplier_booking_confirmed: {
    subject: "[Supplier] Booking Confirmed: #{{bookingId}} - {{tourTitle}}",
    body: "Hello {{supplierName}},<br><br>We are writing to confirm that Booking Reference #{{bookingId}} for '{{tourTitle}}' is now fully confirmed.<br><br><strong>Confirmed Flight/Schedule Details:</strong><br>Date: {{date}}<br>Time Slot: {{time}}<br>Lead Passenger: {{customerName}}<br>Guests: {{guests}}<br><br>Please proceed with standard logistics preparations.",
    enabled: true
  },
  supplier_booking_change_request: {
    subject: "[Supplier] Booking Change Proposed (Pending Review): #{{bookingId}} - {{tourTitle}}",
    body: "Hello {{supplierName}},<br><br>A schedule or participant change has been proposed for Booking #{{bookingId}} ('{{tourTitle}}'). We are currently reviewing the request. Please hold on further logistics arrangements for this booking until approved.<br><br><strong>Proposed New Schedule:</strong><br>New Proposed Date: {{date}}<br>New Proposed Time Slot: {{time}}<br>Guests: {{guests}}",
    enabled: true
  },
  supplier_booking_change_approved: {
    subject: "[Supplier] Booking Change Approved: #{{bookingId}} - {{tourTitle}}",
    body: "Hello {{supplierName}},<br><br>Great news! The proposed modifications for Booking #{{bookingId}} ('{{tourTitle}}') have been approved.<br><br><strong>Updated Schedule and Guest Information:</strong><br>Approved Date: {{date}}<br>Approved Time Slot: {{time}}<br>Guests: {{guests}}<br><br>Please update your operational records.",
    enabled: true
  },
  supplier_booking_cancellation_request: {
    subject: "[Supplier] Cancel Request Received: #{{bookingId}} - {{tourTitle}}",
    body: "Hello {{supplierName}},<br><br>A cancellation request has been registered for Booking #{{bookingId}} ('{{tourTitle}}'). We are confirming details with the super administrator and will advise on approval shortly.",
    enabled: true
  },
  supplier_booking_cancellation_approved: {
    subject: "[Supplier] Booking Cancelled: #{{bookingId}} - {{tourTitle}}",
    body: "Hello {{supplierName}},<br><br>Please be advised that the booking for '{{tourTitle}}' reference #{{bookingId}} has been cancelled and approved.<br><br><strong>Cancelled Booking Details:</strong><br>Reference: #{{bookingId}}<br>Customer: {{customerName}}<br>Date: {{date}}<br><br>Your time slot is now available. No further action is required.",
    enabled: true
  },
  supplier_booking_completed: {
    subject: "[Supplier] Booking Tour Completed: #{{bookingId}} - {{tourTitle}}",
    body: "Hello {{supplierName}},<br><br>Booking Reference #{{bookingId}} ('{{tourTitle}}') has been successfully marked as completed. Thank you for your partnership and service!",
    enabled: true
  },

  // Legacy fallback templates matching original structures
  booking_changed: { 
    subject: "Trip Update Proposed - #{{bookingId}}", 
    body: "You've successfully proposed changes to your trip for {{tourTitle}}. Your current status is now <strong>Review Required</strong>. An admin will review your changes shortly and confirm once approved. Any price difference will be handled accordingly.<br><br>{{supplierInfo}}", 
    enabled: true 
  },
  booking_updated_by_admin: { 
    subject: "Trip Updated by Staff - #{{bookingId}}", 
    body: "Your trip has been successfully updated by our staff. Please find the updated journey details below. If you have any further questions or notice any discrepancies, please contact us immediately.<br><br>{{supplierInfo}}", 
    enabled: true 
  },
  booking_status_updated: { 
    subject: "Booking Update - #{{bookingId}}", 
    body: "Your booking for {{tourTitle}} has been updated with new details. Status: {{status}}. Please review the summary below.<br><br>{{supplierInfo}}", 
    enabled: true 
  },
  booking_date_changed: { 
    subject: "Tour Date Changed - #{{bookingId}}", 
    body: "The date for your tour {{tourTitle}} has been updated to {{date}}. Please check the new schedule below.", 
    enabled: true 
  },
  booking_payment_received: { 
    subject: "Payment Received! - #{{bookingId}}", 
    body: "We've received and verified your payment for #{{bookingId}}. Thank you! Your adventure is fully secured.", 
    enabled: true 
  },
  payment_received: { 
    subject: 'Payment Received - {{tourTitle}}', 
    body: '<p>We have received your payment of {{totalAmount}}.</p>', 
    enabled: true 
  },
  payment_failed: { 
    subject: 'Payment Failed - {{tourTitle}}', 
    body: '<p>Unfortunately, your payment for {{tourTitle}} failed.</p>', 
    enabled: true 
  },
  review_request: { 
    subject: 'Share your experience!', 
    body: '<p>How was your trip to {{tourTitle}}?</p>', 
    enabled: true 
  },
  trip_plan: {
    subject: "Your Bali Trip Plan: {{planTitle}}",
    body: "{{summary}}<br><br>{{planContent}}",
    enabled: true
  }
};

export const emailBaseTemplate = (title: string, subtitle: string, content: string, siteSettings?: any, bookingId?: string) => {
  const primaryColor = siteSettings?.primaryColor || '#1a1a1a';
  const siteName = siteSettings?.siteName || 'Bali Adventours';
  const logo = siteSettings?.logo;
  const supportEmail = siteSettings?.supportEmail || 'info@baliadventours.com';
  const supportPhone = siteSettings?.supportPhone || '+6281246502939';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0 !important; }
            .header-td { padding: 30px 20px !important; }
            .content-td { padding: 30px 20px !important; }
            .footer-td { padding: 0 20px 30px !important; }
            .title-text { font-size: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <!-- Logo -->
                <div style="margin-bottom: 30px;">
                    ${logo ? `
                        <img src="${logo}" alt="${siteName}" style="max-height: 40px; display: block;" />
                    ` : `
                        <div style="color: #0f172a; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase;">${siteName}</div>
                    `}
                </div>

                <!-- Main Card -->
                <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; margin: 0 auto;">
                    <!-- Minimal Header -->
                    <tr>
                        <td class="header-td" style="padding: 40px; border-bottom: 1px solid #f1f5f9;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td valign="middle">
                                        <div style="width: 30px; height: 2px; background-color: ${primaryColor}; margin-bottom: 15px;"></div>
                                        <div class="title-text" style="font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.1; margin-bottom: 8px; text-transform: uppercase;">${title}</div>
                                        <div style="font-size: 14px; font-weight: 500; color: #64748b;">${subtitle}</div>
                                    </td>
                                    ${bookingId ? `
                                    <td align="right" valign="top">
                                        <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Reference</div>
                                        <div style="font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">#${bookingId}</div>
                                    </td>
                                    ` : ''}
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content-td" style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Minimal Footer -->
                    <tr>
                        <td class="footer-td" style="padding: 0 40px 40px;">
                            <div style="text-align: left; border-top: 1px solid #f1f5f9; padding-top: 30px;">
                                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                                    Questions? Reach us at <a href="mailto:${supportEmail}" style="color: #0f172a; font-weight: 700; text-decoration: none;">${supportEmail}</a><br>
                                    WhatsApp Support: <a href="tel:${supportPhone}" style="color: #0f172a; font-weight: 700; text-decoration: none;">${supportPhone}</a>
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Bottom Copyright -->
                <div style="padding: 40px 20px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                        &copy; ${new Date().getFullYear()} ${siteName}. Your Bali Travel Partner.
                    </p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

export const bookingDetailsSection = (booking: any, siteSettings?: any, isAdmin: boolean = false, options: { showImportantNote?: boolean; showVoucher?: boolean } = {}) => {
  const primaryColor = siteSettings?.primaryColor || '#0f172a';

  return `
    <p style="font-size: 15px; color: #1e293b; margin-bottom: 25px; line-height: 1.6;">{{greeting}}</p>
    <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 40px;">
        {{body}}
    </p>

    <div style="margin-bottom: 40px;">
        <!-- Tour Details -->
        <div style="margin-bottom: 40px;">
            <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
                Adventure Details
            </div>
            <table width="100%" style="font-size: 14px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 0; color: #64748b;">Schedule</td>
                    <td align="right" style="padding: 12px 0; font-weight: 700; color: #0f172a;">{{date}} at {{time}}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #64748b;">Participants</td>
                    <td align="right" style="padding: 12px 0; font-weight: 700; color: #0f172a;">{{guests}}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 0; color: #64748b; vertical-align: top;">Pickup Point</td>
                    <td align="right" style="padding: 12px 0; font-weight: 700; color: #0f172a; max-width: 250px;">{{pickupAddress}}</td>
                </tr>
                {{supplierRow}}
                ${isAdmin ? '' : `{{guideRow}}`}
            </table>
        </div>

        <!-- Price Summary -->
        <div style="margin-bottom: 10px;">
            <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
                Financial Summary
            </div>
            <table width="100%" style="font-size: 14px; border-collapse: collapse;">
                {{priceBreakdown}}
                <tr>
                    <td style="padding: 24px 0 0; font-weight: 700; color: #64748b; font-size: 13px; text-transform: uppercase;">Total Paid</td>
                    <td align="right" style="padding: 24px 0 0; font-weight: 800; color: #0f172a; font-size: 22px;">{{totalAmount}}</td>
                </tr>
            </table>
        </div>
    </div>

    ${isAdmin ? `
    <!-- Staff Management Info -->
    <div style="margin-top: 40px; padding: 30px; background-color: #f8fafc; border-radius: 4px; border: 1px solid #f1f5f9;">
        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">
            Staff Record
        </div>
        <table width="100%" style="font-size: 13px;">
            <tr>
                <td style="padding: 6px 0; color: #64748b;">Customer</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">{{customerName}}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #64748b;">Phone</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">{{phone}}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #64748b;">Email</td>
                <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">{{email}}</td>
            </tr>
        </table>
    </div>
    ` : `
    {{paymentInstructions}}

    <!-- Minimal Voucher (Confirmed Only) -->
    ${options.showVoucher ? `
    <div style="margin-top: 50px; padding: 40px; border: 1px solid #0f172a; position: relative;">
        <div style="position: absolute; top: -10px; left: 20px; background: #ffffff; padding: 0 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Voucher</div>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td valign="top">
                    <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 5px;">{{tourTitle}}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 25px; text-transform: uppercase;">{{packageName}}</div>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                        <tr>
                            <td style="padding-bottom: 15px; color: #64748b;">Trip Date: <strong>{{date}}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 15px; color: #64748b;">Time Slot: <strong>{{time}}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 15px; color: #64748b;">Lead Guest: <strong>{{customerName}}</strong></td>
                        </tr>
                    </table>
                </td>
                <td width="100" align="right" valign="top">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://baliadventours.com/admin/booking/{{bookingId}}" width="90" height="90" style="display: block; border: 1px solid #f1f5f9;" />
                    <div style="font-size: 9px; font-weight: 700; color: #94a3b8; margin-top: 8px; text-transform: uppercase;">#{{bookingId}}</div>
                </td>
            </tr>
        </table>
    </div>
    ` : ''}
    
    ${options.showImportantNote ? `
    <div style="margin-top: 30px; padding: 20px; border-left: 2px solid #f59e0b; background-color: #fffbeb;">
        <div style="font-weight: 700; font-size: 14px; color: #92400e; margin-bottom: 4px;">Important Note</div>
        <div style="font-size: 13px; color: #b45309; line-height: 1.6;">
            Our team will contact you via WhatsApp for final coordination. Please ensure your contact details are correct.
        </div>
    </div>
    ` : ''}
    `}
`;
};

