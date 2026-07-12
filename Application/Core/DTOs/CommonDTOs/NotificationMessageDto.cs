namespace Application.Core.DTOs.CommonDTOs;

public sealed class NotificationMessageDto
{
    public string? Title { get; set; }
    public string? Body { get; set; }
    public string? Type { get; set; }
    public string? Url { get; set; }
    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
    public IDictionary<string, object?> Data { get; set; } = new Dictionary<string, object?>();
}
