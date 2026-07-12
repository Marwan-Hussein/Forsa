using Application.Core.DTOs.CommonDTOs;

namespace Application.Core.Interfaces;

public interface INotifierService
{
    Task SendAsync(string subscriber, NotificationMessageDto message, CancellationToken cancellationToken = default);
    Task SendAsync(int subscriberId, NotificationMessageDto message, CancellationToken cancellationToken = default);
    Task BroadcastAsync(NotificationMessageDto message, CancellationToken cancellationToken = default);
    Task NotifyMessagesUpdatedAsync(CancellationToken cancellationToken = default);
}
