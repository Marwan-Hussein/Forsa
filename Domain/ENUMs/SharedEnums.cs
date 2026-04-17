
namespace Domain.ENUMs
{
    public enum Roles
    {
        guest = 1,
        Attendee , 
        Owner, 
        Admin 
    }

    public enum NotificationType
    {
        GeneralAlert = 1,
        BookingConfirmation = 2,
        EventUpdate = 3,
        CertificateReady = 4
    }

    public enum DeliveryMethod
    {
        Email = 1,
        WhatsApp = 2,
        Both = 3
    }

    public enum NotificationStatus
    {
        Pending = 1,
        Sent = 2,
        Failed = 3
    }

    public enum RequestStatus
    {
        Pending = 1,
        Accepted = 2,
        Rejected = 3,
        Expired = 4,
        Cancelled = 5
    }
}
