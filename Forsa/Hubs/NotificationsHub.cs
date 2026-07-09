using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace Forsa.Hubs
{
    [Authorize]
    public class NotificationsHub : Hub
    {
        private readonly ILogger<NotificationsHub> _logger;

        public NotificationsHub(ILogger<NotificationsHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            _logger.LogInformation("[NotificationsHub] Client connected. ConnectionId={ConnectionId}, UserId={UserId}",
                Context.ConnectionId, userId ?? "anonymous");

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                _logger.LogInformation("[NotificationsHub] Added ConnectionId={ConnectionId} to group '{Group}'",
                    Context.ConnectionId, userId);
            }
            else
            {
                _logger.LogWarning("[NotificationsHub] No UserIdentifier found for ConnectionId={ConnectionId}. Notifications will not be delivered.",
                    Context.ConnectionId);
            }

            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            if (exception != null)
                _logger.LogWarning(exception, "[NotificationsHub] Client disconnected with error. ConnectionId={ConnectionId}", Context.ConnectionId);
            else
                _logger.LogInformation("[NotificationsHub] Client disconnected gracefully. ConnectionId={ConnectionId}", Context.ConnectionId);

            return base.OnDisconnectedAsync(exception);
        }
    }
}
