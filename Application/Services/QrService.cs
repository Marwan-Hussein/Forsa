using Application.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class QrService : IQrService
    {
        public byte[] GenerateQrImage(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("QR text payload cannot be null or empty.", nameof(key));
            }

            using var qrGenerator = new QRCoder.QRCodeGenerator();

            using var qrCodeData = qrGenerator.CreateQrCode(key, QRCoder.QRCodeGenerator.ECCLevel.Q);

            using var qrCode = new QRCoder.PngByteQRCode(qrCodeData);

            return qrCode.GetGraphic(20);
        }
    }
}
