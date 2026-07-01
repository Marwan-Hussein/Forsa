using Application.Core.DTOs.Payment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces
{
    public interface IPaymentService
    {
        // ==========================================
        // PHASE 1: MONEY IN (Paymob Accept API)
        // ==========================================

        Task<PaymentResponseDto> InitiatePaymentProcess(int transactionId);

        // ==========================================
        // PHASE 2: THE LEDGER (Paymob Webhook)
        // ==========================================
        Task<bool> ProcessPaymentCallbackAsync(PaymobWebhookDto webhookPayload);

        // ==========================================
        // PHASE 3: MONEY OUT (Paymob Payouts API)
        // ==========================================
        Task<PayoutResponseDto> InitiateOrganizerPayoutAsync(int userId, decimal amount);

        // ==========================================
        // BONUS: REFUNDS (Paymob Refund API)
        // ==========================================
        Task<RefundResponseDto> ProcessRefundAsync(int transactionId);

        // ==========================================
        // PAYOUT CONFIGURATION
        // ==========================================
        Task<bool> ConfigurePayoutMethodAsync(int userId, ConfigurePayoutMethodDto dto);
    }
}
