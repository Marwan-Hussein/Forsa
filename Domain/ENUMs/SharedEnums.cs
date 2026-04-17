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
    public enum EventStatus
    {
        Draft,
        Published,
        Cancelled,
        Completed
    }

    public enum BookingStatus
    {
        Confirmed,
        Cancelled
    }

    public enum MediaType
    {
        Image,
        Video
    }
}
