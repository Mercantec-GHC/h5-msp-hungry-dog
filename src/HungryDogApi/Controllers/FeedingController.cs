using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HungryDogApi.DTOs;
using HungryDogApi.Services;
using HungryDogApi.Data;
using HungryDogApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HungryDogApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
// FeedingController håndterer både foderberegninger og de måltider brugeren logger.
public class FeedingController : ControllerBase
{
    private readonly IFeedingService _feedingService;
    private readonly AppDbContext _context;

    public FeedingController(IFeedingService feedingService, AppDbContext context)
    {
        _feedingService = feedingService;
        _context = context;
    }

    // UserId fra token bruges i alle opslag, så foderdata ikke blandes mellem brugere.
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    /// <summary>
    /// Beregner foderbehov ud fra alder, vægt, race og aktivitet.
    /// </summary>
    [HttpPost("calculate")]
    public async Task<ActionResult<FeedingRecommendationDto>> CalculateFeedingNeeds([FromBody] CalculateFeedingNeedsRequest request)
    {
        try
        {
            var recommendation = await _feedingService.CalculateFeedingNeedsAsync(request.DogId, GetUserId());
            
            return Ok(new FeedingRecommendationDto
            {
                Id = recommendation.Id,
                DogId = recommendation.DogId,
                DailyCaloriesNeeded = recommendation.DailyCaloriesNeeded,
                RestingEnergyExpenditure = recommendation.RestingEnergyExpenditure,
                ActivityMultiplier = recommendation.ActivityMultiplier,
                BreedAdjustment = recommendation.BreedAdjustment,
                Notes = recommendation.Notes,
                CalculatedAt = recommendation.CalculatedAt,
                NextReviewDate = recommendation.NextReviewDate
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Henter den nyeste foderanbefaling for en hund.
    /// </summary>
    [HttpGet("{dogId}/latest")]
    public async Task<ActionResult<FeedingRecommendationDto>> GetLatestRecommendation(int dogId)
    {
        try
        {
            var recommendation = await _feedingService.GetLatestRecommendationAsync(dogId, GetUserId());

            return Ok(new FeedingRecommendationDto
            {
                Id = recommendation.Id,
                DogId = recommendation.DogId,
                DailyCaloriesNeeded = recommendation.DailyCaloriesNeeded,
                RestingEnergyExpenditure = recommendation.RestingEnergyExpenditure,
                ActivityMultiplier = recommendation.ActivityMultiplier,
                BreedAdjustment = recommendation.BreedAdjustment,
                Notes = recommendation.Notes,
                CalculatedAt = recommendation.CalculatedAt,
                NextReviewDate = recommendation.NextReviewDate
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Henter detaljeret foderinformation for en hund.
    /// </summary>
    [HttpGet("{dogId}/details")]
    public async Task<ActionResult<FeedingDetailsDto>> GetFeedingDetails(int dogId)
    {
        try
        {
            var userId = GetUserId();
            var dog = await _context.Dogs.FirstOrDefaultAsync(d => d.Id == dogId && d.UserId == userId);
            if (dog == null)
                return NotFound(new { message = $"Dog with id {dogId} not found" });

            var recommendation = await _feedingService.GetLatestRecommendationAsync(dogId, userId);

            return Ok(new FeedingDetailsDto
            {
                DogName = dog.Name,
                Weight = dog.CurrentWeight,
                AgeInMonths = dog.AgeInMonths,
                DailyActivityDuration = dog.DailyActivityDuration,
                DailyCaloriesNeeded = recommendation.DailyCaloriesNeeded,
                RestingEnergyExpenditure = recommendation.RestingEnergyExpenditure,
                ActivityMultiplier = recommendation.ActivityMultiplier,
                FeedingGuide = GenerateFeedingGuide(recommendation.DailyCaloriesNeeded, dog.AgeInMonths),
                CalculatedAt = recommendation.CalculatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Henter alle foderanbefalinger for en hund.
    /// </summary>
    [HttpGet("{dogId}/history")]
    public async Task<ActionResult<List<FeedingRecommendationDto>>> GetFeedingHistory(int dogId)
    {
        var userId = GetUserId();
        var recommendations = await _context.FeedingRecommendations
            .Where(f => f.DogId == dogId && f.Dog.UserId == userId)
            .OrderByDescending(f => f.CalculatedAt)
            .Select(f => new FeedingRecommendationDto
            {
                Id = f.Id,
                DogId = f.DogId,
                DailyCaloriesNeeded = f.DailyCaloriesNeeded,
                RestingEnergyExpenditure = f.RestingEnergyExpenditure,
                ActivityMultiplier = f.ActivityMultiplier,
                BreedAdjustment = f.BreedAdjustment,
                Notes = f.Notes,
                CalculatedAt = f.CalculatedAt,
                NextReviewDate = f.NextReviewDate
            })
            .ToListAsync();

        return Ok(recommendations);
    }

    [HttpPost("meal-log")]
    public async Task<ActionResult<MealLogDto>> CreateMealLog([FromBody] CreateMealLogRequest request)
    {
        var userId = GetUserId();
        // Måltider må kun logges på hunde, som brugeren selv ejer.
        var dogExists = await _context.Dogs.AnyAsync(d => d.Id == request.DogId && d.UserId == userId);
        if (!dogExists)
            return NotFound(new { message = $"Dog with id {request.DogId} not found" });

        // Navn og mængde normaliseres, så frontend kan sende små variationer i tekst.
        var mealLog = new MealLog
        {
            DogId = request.DogId,
            MealName = NormalizeMealName(request.MealName),
            AmountEaten = NormalizeAmountEaten(request.AmountEaten),
            LoggedAt = DateTime.UtcNow
        };

        _context.MealLogs.Add(mealLog);
        await _context.SaveChangesAsync();

        return Ok(ToMealLogDto(mealLog));
    }

    [HttpGet("{dogId}/meal-log/latest")]
    public async Task<ActionResult<MealLogDto>> GetLatestMealLog(int dogId)
    {
        var userId = GetUserId();
        var dogExists = await _context.Dogs.AnyAsync(d => d.Id == dogId && d.UserId == userId);
        if (!dogExists)
            return NotFound(new { message = $"Dog with id {dogId} not found" });

        var mealLog = await _context.MealLogs
            .Where(m => m.DogId == dogId)
            .OrderByDescending(m => m.LoggedAt)
            .FirstOrDefaultAsync();

        if (mealLog == null)
        {
            // Hvis brugeren ikke har registreret et måltid, viser appen "All" som standard.
            return Ok(new MealLogDto
            {
                Id = 0,
                DogId = dogId,
                MealName = "Breakfast",
                AmountEaten = "All",
                LoggedAt = DateTime.UtcNow
            });
        }

        return Ok(ToMealLogDto(mealLog));
    }

    [HttpGet("{dogId}/meal-log/recent")]
    public async Task<ActionResult<List<MealLogDto>>> GetRecentMealLogs(int dogId, [FromQuery] int days = 7)
    {
        var userId = GetUserId();
        var dogExists = await _context.Dogs.AnyAsync(d => d.Id == dogId && d.UserId == userId);
        if (!dogExists)
            return NotFound(new { message = $"Dog with id {dogId} not found" });

        var cutoff = DateTime.UtcNow.AddDays(-Math.Max(days, 1));
        var mealLogs = await _context.MealLogs
            .Where(m => m.DogId == dogId && m.LoggedAt >= cutoff)
            .OrderByDescending(m => m.LoggedAt)
            .Select(m => new MealLogDto
            {
                Id = m.Id,
                DogId = m.DogId,
                MealName = m.MealName,
                AmountEaten = m.AmountEaten,
                LoggedAt = m.LoggedAt
            })
            .ToListAsync();

        return Ok(mealLogs);
    }

    private string GenerateFeedingGuide(decimal dailyCalories, int ageInMonths)
    {
        // Guiden er menneskelæsbar tekst til UI'et og ikke en separat databaseværdi.
        var mealsPerDay = ageInMonths < 6 ? 4 : ageInMonths < 12 ? 3 : 2;
        var caloriesPerMeal = dailyCalories / mealsPerDay;

        var guide = $"Feed {mealsPerDay} times daily: ";
        guide += $"Approximately {caloriesPerMeal:F0} kcal per meal. ";
        guide += "Adjust portions based on body condition and individual metabolism. ";

        if (ageInMonths < 12)
        {
            guide += "Use high-quality puppy food. ";
        }
        else if (ageInMonths > 96)
        {
            guide += "Consider senior diet formula. ";
        }

        guide += "Always provide fresh water.";

        return guide;
    }

    private static string NormalizeAmountEaten(string? amountEaten)
    {
        // Normalisering gør frontend mere fleksibel: "nothing" og "none" gemmes ens.
        return amountEaten?.Trim().ToLowerInvariant() switch
        {
            "none" or "nothing" => "None",
            "small" or "small bit" => "Small",
            "half" => "Half",
            _ => "All",
        };
    }

    private static string NormalizeMealName(string? mealName)
    {
        // Appen arbejder kun med to daglige måltider for at holde løsningen simpel.
        return mealName?.Trim().ToLowerInvariant() switch
        {
            "dinner" or "evening" or "aftensmad" => "Dinner",
            _ => "Breakfast",
        };
    }

    private static MealLogDto ToMealLogDto(MealLog mealLog)
    {
        // Samlet mapping gør det nemt at ændre DTO'en ét sted.
        return new MealLogDto
        {
            Id = mealLog.Id,
            DogId = mealLog.DogId,
            MealName = mealLog.MealName,
            AmountEaten = mealLog.AmountEaten,
            LoggedAt = mealLog.LoggedAt
        };
    }
}
