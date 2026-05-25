using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HungryDogApi.DTOs;
using HungryDogApi.Services;
using System.Security.Claims;

namespace HungryDogApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
// WeightController samler vægtlogning, historik og simple trend-endpoints.
public class WeightController : ControllerBase
{
    private readonly IWeightService _weightService;

    public WeightController(IWeightService weightService)
    {
        _weightService = weightService;
    }

    // Claimet sættes af TokenService og bruges til at slå op i brugerens egne hunde.
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    /// <summary>
    /// Tilføjer en vægtmåling for en hund.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WeightRecordDto>> AddWeightRecord([FromBody] CreateWeightRecordRequest request)
    {
        try
        {
            var record = await _weightService.AddWeightRecordAsync(
                request.DogId, 
                GetUserId(),
                request.Weight, 
                request.RecordedAt);

            return Ok(new WeightRecordDto
            {
                Id = record.Id,
                DogId = record.DogId,
                Weight = record.Weight,
                RecordedAt = record.RecordedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Henter vægthistorik for en hund.
    /// </summary>
    [HttpGet("{dogId}/history")]
    public async Task<ActionResult<List<WeightRecordDto>>> GetWeightHistory(int dogId, [FromQuery] int months = 12)
    {
        try
        {
            var records = await _weightService.GetWeightHistoryAsync(dogId, GetUserId(), months);
            var dtos = records.Select(r => new WeightRecordDto
            {
                Id = r.Id,
                DogId = r.DogId,
                Weight = r.Weight,
                RecordedAt = r.RecordedAt
            }).ToList();

            return Ok(dtos);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Beregner simpel vægttrend pr. måned.
    /// </summary>
    [HttpGet("{dogId}/trend")]
    public async Task<ActionResult<object>> GetWeightTrend(int dogId)
    {
        try
        {
            var trend = await _weightService.CalculateWeightTrendAsync(dogId, GetUserId());
            
            if (trend == null)
            {
                return Ok(new { 
                    trend = (decimal?)null, 
                    message = "Not enough data to calculate trend" 
                });
            }

            return Ok(new 
            { 
                trend = trend,
                interpretation = trend > 0 ? "Weight increasing" : trend < 0 ? "Weight decreasing" : "Weight stable"
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Henter vægtstatus. Bruges simpelt i projektet som tracking.
    /// </summary>
    [HttpGet("{dogId}/status")]
    public async Task<ActionResult<object>> GetWeightStatus(int dogId)
    {
        try
        {
            var status = await _weightService.GetWeightStatusAsync(dogId, GetUserId());
            return Ok(new { status });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
