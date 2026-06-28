using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.LLM
{
    public class LLMDTO
    {
        public record ChatHistoryMessageDto(string Content, bool IsUser);
        public record ChatRequest(string Message, List<ChatHistoryMessageDto> History);
    }
}
