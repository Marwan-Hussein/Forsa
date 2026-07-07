using Application.Core.DTOs.CommonDTOs;
using Application.Core.Interfaces;
using Forsa.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Application.Services;

public sealed class SignalRNotifierService : INotifierService
{
    public const string ReceiveNotificationMethod = "receiveNotification";
    public const string UpdateMessagesMethod = "updateMessages";

    private readonly IHubContext<NotificationsHub> _hubContext;

    public SignalRNotifierService(IHubContext<NotificationsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task SendAsync(string subscriber, NotificationMessageDto message, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(subscriber);
        ArgumentNullException.ThrowIfNull(message);

        return _hubContext.Clients
            .Group(subscriber)
            .SendAsync(ReceiveNotificationMethod, message, cancellationToken);
    }

    public Task SendAsync(int subscriberId, NotificationMessageDto message, CancellationToken cancellationToken = default)
    {
        return SendAsync(subscriberId.ToString(), message, cancellationToken);
    }

    public Task BroadcastAsync(NotificationMessageDto message, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(message);

        return _hubContext.Clients
            .All
            .SendAsync(ReceiveNotificationMethod, message, cancellationToken);
    }

    public Task NotifyMessagesUpdatedAsync(CancellationToken cancellationToken = default)
    {
        return _hubContext.Clients
            .All
            .SendAsync(UpdateMessagesMethod, cancellationToken);
    }
}
