using Application.Core.Interfaces.LLMInterfaces;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.Core.DTOs.LLM.LLMDTO;
using Microsoft.SemanticKernel.Connectors.Google;


namespace Application.Services.LLMServices
{
    public class LLMService : ILLMService
    {
        private readonly Kernel _kernel;
        private readonly IChatCompletionService _chatCompletion;

        public LLMService(Kernel kernel)
        {
            _kernel = kernel;
            _chatCompletion = kernel.GetRequiredService<IChatCompletionService>();
        }

        public async Task<string> ExecuteChatAsync(string userMessage, List<ChatHistoryMessageDto> history, string? systemContext = null)
        {
            var chatHistory = new ChatHistory();

            chatHistory.AddSystemMessage(
                "You are 'Forsa Bot', the official AI smart assistant for the Forsa platform, which specializes in event management, ticketing, and venue hosting. " +
                "Always communicate in a professional, polite, and welcoming manner. Adapt your tone to be light, friendly, and match the user's language choice. " +
                "CRITICAL INSTRUCTION: You have been provided with a specific 'User Context' containing the user's profile, active bookings, and dashboard stats. " +
                "ALWAYS check this 'User Context' first to answer personal questions (e.g., 'What are my bookings?', 'How many events do I have?'). " +
                "ONLY invoke plugins if the user asks for external information (like searching for new venues/events), real-time live inventory, or if the data is missing from the context. " +
                "Never hallucinate or guess ticket prices, dates, or availability. If an organizer requests analytics, ask for the Event ID if missing." +
                "Do NOT invoke any tools or functions to retrieve personal bookings, places, or statistics if that information is already provided to you in the 'FORSA USER CONTEXT'. Only read from the provided context. ONLY use tools for searching external events/venues or checking LIVE inventory when the user explicitly requests it. "
            );

            // Inject the rich user context passed from the frontend (profile, bookings, events, etc.)
            // This allows the AI to answer personal questions without needing extra plugin calls.
            if (!string.IsNullOrWhiteSpace(systemContext))
            {
                chatHistory.AddSystemMessage(systemContext);
            }

            foreach (var msg in history)
            {
                if (msg.IsUser) chatHistory.AddUserMessage(msg.Content);
                else chatHistory.AddAssistantMessage(msg.Content);
            }

            chatHistory.AddUserMessage(userMessage);

            var settings = new GeminiPromptExecutionSettings
            {
                ToolCallBehavior = GeminiToolCallBehavior.AutoInvokeKernelFunctions
            };

            var result = await _chatCompletion.GetChatMessageContentAsync(chatHistory, settings, _kernel);

            // Updated fallback error message to English
            return result.Content ?? "I am here to help, but I couldn't process your request at the moment. Could you please rephrase your question?";
        }
    }
}