namespace Application.Core.Settings
{
    public class GoogleCalendarSettings
    {
        // path to the google service account credentials JSON file.
        public string ServiceAccountKeyPath { get; set; }

        // when initializing the CalendarService.
        public string ApplicationName { get; set; } = "Forsa";

        // The target calendar ID to create events in.
        // Use "primary" for the service account's own calendar,
        // or a specific calendar ID (e.g., "abc123@group.calendar.google.com").
        public string CalendarId { get; set; } = "primary";
    }
}
