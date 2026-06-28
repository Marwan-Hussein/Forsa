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

        public async Task<string> ExecuteChatAsync(string userMessage, List<ChatHistoryMessageDto> history)
        {
            var chatHistory = new ChatHistory();

            // Updated System Prompt to English with clear formatting and instructions
            chatHistory.AddSystemMessage(
                "You are 'Forsa Bot', the official AI smart assistant for the Forsa platform, which specializes in event management, ticketing, and venue hosting. " +
                "Always communicate in a professional, polite, and welcoming manner. It is highly preferred to respond using light, friendly Tone and adapted to the user's language choice. " +
                "The available tools and plugins are described in English. Map the user's queries to the correct tool parameters seamlessly. " +
                "Always use the provided Plugins to fetch real-time data from the database. Never hallucinate, guess, or fabricate ticket prices, dates, or availability. " +
                "If an organizer requests a sales report or specific event analytics, politely ask them to provide the Event ID first if they haven't mentioned it.");

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