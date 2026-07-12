using Application.Core.Interfaces.LLMInterfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static Application.Core.DTOs.LLM.LLMDTO;

namespace Forsa.Controllers.LLMController
{
    [Route("api/[controller]")]
    [ApiController]
    public class LLMController : ControllerBase
    {
        private readonly ILLMService _LLMService;

        public LLMController(ILLMService _LLMService)
        {
            this._LLMService = _LLMService;
        }

        [HttpPost("ask")]
        [Authorize]
        public async Task<IActionResult> AskBot([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { error = "Can not Send An Empty Message" });

            try
            {
                var botResponse = await _LLMService.ExecuteChatAsync(request.Message, request.History, request.SystemContext);
                return Ok(new { response = botResponse });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}
