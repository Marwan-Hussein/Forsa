namespace Application.Core.DTOs.AttendeeDTOs
{
    public class WishlistEventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public double TicketPrice { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
    }
}
