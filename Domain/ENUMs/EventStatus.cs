namespace Domain.ENUMs
{
    public enum EventStatus
    {
        Draft,
        Pending,
        Approved,
        Rejected,
        Published,
        SoldOut, // in case no more available tickets
        Cancelled,
        Completed
    }
}