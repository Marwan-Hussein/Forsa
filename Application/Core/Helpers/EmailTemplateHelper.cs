using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Core.Helpers
{
    public static class EmailTemplateHelper
    {
        public static string BuildHtmlTemplate(string title, string body, Dictionary<string, string> details)
        {
            var detailsRowsBuilder = new StringBuilder();
            if (details != null && details.Count > 0)
            {
                foreach (var detail in details)
                {
                    detailsRowsBuilder.Append($@"
                        <tr>
                            <td style='padding: 8px 0; color: #4b5563; font-weight: 500; font-size: 14px; width: 40%; vertical-align: top;'>{detail.Key}</td>
                            <td style='padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px; text-align: right; vertical-align: top;'>{detail.Value}</td>
                        </tr>");
                }
            }

            string detailsSection = "";
            if (detailsRowsBuilder.Length > 0)
            {
                detailsSection = $@"
                    <div style='background-color: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #f3f4f6; margin-bottom: 24px; text-align: left;'>
                        <h3 style='font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;'>Details</h3>
                        <table style='width: 100%; border-collapse: collapse;'>
                            <tbody>
                                {detailsRowsBuilder}
                            </tbody>
                        </table>
                    </div>";
            }

            // Convert raw line breaks in the body to HTML paragraph/break tags
            var formattedBody = body.Replace("\n", "<br/>");

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
</head>
<body style='margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;'>
    <div style='background-color: #f3f4f6; padding: 40px 16px; min-height: 100%;'>
        <div style='max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;'>
            
            <!-- Header -->
            <div style='background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 24px; text-align: center;'>
                <span style='font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; display: inline-block; text-transform: uppercase;'>Forsa</span>
                <div style='margin-top: 6px; color: #e0e7ff; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;'>Your Gateway to Exceptional Experiences</div>
            </div>
            
            <!-- Content Area -->
            <div style='padding: 40px 32px; text-align: center;'>
                <h2 style='font-size: 22px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 20px; line-height: 1.3;'>{title}</h2>
                <div style='font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 28px; text-align: left;'>
                    {formattedBody}
                </div>
                
                {detailsSection}
                
                <!-- CTA / Support Note -->
                <div style='margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;'>
                    <p style='font-size: 13px; color: #9ca3af; margin: 0;'>Have questions? Contact our support team at <a href='mailto:support@forsa.com' style='color: #4f46e5; text-decoration: none; font-weight: 500;'>support@forsa.com</a></p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style='background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;'>
                <p style='font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;'>This is an automated notification from Forsa. Please do not reply directly to this email.</p>
                <p style='font-size: 12px; color: #9ca3af; margin: 0;'>&copy; {DateTime.UtcNow.Year} Forsa. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>";
        }
    }
}
