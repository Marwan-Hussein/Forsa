namespace Domain.Entities.OrganizerEntities
{
    public class OrganizationType
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }

        // Relationships
        public List<Organizer> Organizers { get; set; }

        // Navigation properties
        public List<OrganiztionTypeWithOrganizer> OrganiztionTypeWithOrganizers { get; set; }

    }
}
