using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Application.Core.DTOs.LLM.LLMDTO;

namespace Application.Core.Interfaces.LLMInterfaces
{
    public interface ILLMService
    {
        Task<string> ExecuteChatAsync(string userMessage, List<ChatHistoryMessageDto> history);
    }
}
