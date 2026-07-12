using Application.Core.DTOs.CommonDTOs;
using Application.Core.Interfaces;
using Forsa.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Forsa.Services;

public sealed class SignalRNotifierService : INotifierService
{
    public const string ReceiveNotificationMethod = "receiveNotification";
    public const string UpdateMessagesMethod = "updateMessages";

    private readonly IHubContext<NotificationsHub> _hubContext;
    private readonly ILogger<SignalRNotifierService> _logger;

    public SignalRNotifierService(IHubContext<NotificationsHub> hubContext, ILogger<SignalRNotifierService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendAsync(string subscriber, NotificationMessageDto message, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(subscriber);
        ArgumentNullException.ThrowIfNull(message);

        _logger.LogInformation("[Notifications] Sending SignalR notification to group '{Subscriber}': {Title}", subscriber, message.Title);
        try
        {
            await _hubContext.Clients
                .Group(subscriber)
                .SendAsync(ReceiveNotificationMethod, message, cancellationToken);
            _logger.LogInformation("[Notifications] Successfully sent notification to group '{Subscriber}'", subscriber);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Notifications] Failed to send SignalR notification to group '{Subscriber}'", subscriber);
            throw;
        }
    }

    public Task SendAsync(int subscriberId, NotificationMessageDto message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("[Notifications] Resolving group for UserId={SubscriberId}", subscriberId);
        return SendAsync(subscriberId.ToString(), message, cancellationToken);
    }

    public async Task BroadcastAsync(NotificationMessageDto message, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(message);

        _logger.LogInformation("[Notifications] Broadcasting notification to all clients: {Title}", message.Title);
        try
        {
            await _hubContext.Clients
                .All
                .SendAsync(ReceiveNotificationMethod, message, cancellationToken);
            _logger.LogInformation("[Notifications] Broadcast complete");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Notifications] Broadcast failed");
            throw;
        }
    }

    public Task NotifyMessagesUpdatedAsync(CancellationToken cancellationToken = default)
    {
        return _hubContext.Clients
            .All
            .SendAsync(UpdateMessagesMethod, cancellationToken);
    }
}
