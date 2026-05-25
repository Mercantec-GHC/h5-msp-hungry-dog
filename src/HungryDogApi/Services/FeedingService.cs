using HungryDogApi.Data;
using HungryDogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HungryDogApi.Services;

// Interface beskriver de foderberegninger controlleren kan bruge.
public interface IFeedingService
{
    Task<FeedingRecommendation> CalculateFeedingNeedsAsync(int dogId, int userId);
    Task<FeedingRecommendation> GetLatestRecommendationAsync(int dogId, int userId);
    Task<decimal> CalculateRestingEnergyExpenditureAsync(decimal weightKg, int ageInMonths);
    decimal GetActivityMultiplier(string activityDuration, int ageInMonths);
}

public class FeedingService : IFeedingService
{
    private readonly AppDbContext _context;

    public FeedingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FeedingRecommendation> CalculateFeedingNeedsAsync(int dogId, int userId)
    {
        // Første opslag tjekker både at hunden findes, og at den tilhører brugeren.
        var dog = await GetUserDogAsync(dogId, userId);
        if (dog == null)
            throw new InvalidOperationException($"Dog with id {dogId} not found");

        // RER er et simpelt estimat for hundens basis-energiforbrug.
        var rer = await CalculateRestingEnergyExpenditureAsync((decimal)dog.CurrentWeight, dog.AgeInMonths);

        // Aktivitet ganges på RER, så en mere aktiv hund får højere anbefaling.
        var activityMultiplier = GetActivityMultiplier(dog.DailyActivityDuration, dog.AgeInMonths);

        var dailyCalories = rer * activityMultiplier;

        // Race bruges kun som en kort tekst-anbefaling, ikke som en præcis medicinsk beregning.
        var breedAdjustment = GetBreedAdjustment(dog.Breed);

        var recommendation = new FeedingRecommendation
        {
            DogId = dogId,
            RestingEnergyExpenditure = rer,
            ActivityMultiplier = activityMultiplier,
            DailyCaloriesNeeded = dailyCalories,
            BreedAdjustment = breedAdjustment,
            CalculatedAt = DateTime.UtcNow,
            NextReviewDate = DateTime.UtcNow.AddMonths(1),
            Notes = GenerateFeedingNotes(dog, dailyCalories)
        };

        _context.FeedingRecommendations.Add(recommendation);
        await _context.SaveChangesAsync();

        return recommendation;
    }

    public async Task<FeedingRecommendation> GetLatestRecommendationAsync(int dogId, int userId)
    {
        // Ejerskab kontrolleres før anbefalingen læses fra historikken.
        var dog = await GetUserDogAsync(dogId, userId);
        if (dog == null)
            throw new InvalidOperationException($"Dog with id {dogId} not found");

        return await _context.FeedingRecommendations
            .Where(f => f.DogId == dogId)
            .OrderByDescending(f => f.CalculatedAt)
            .FirstOrDefaultAsync() 
            ?? throw new InvalidOperationException($"No feeding recommendation found for dog {dogId}");
    }

    public async Task<decimal> CalculateRestingEnergyExpenditureAsync(decimal weightKg, int ageInMonths)
    {
        // Forenklet RER formel: 70 * (vægt i kg)^0.75.
        // Hvalpe og seniorhunde får en simpel justering, så modellen er let at forklare.

        var baseRER = 70 * (decimal)Math.Pow((double)weightKg, 0.75);

        if (ageInMonths < 12)
        {
            return baseRER * 2; // Hvalpe har typisk brug for mere energi.
        }
        else if (ageInMonths > 96) // Cirka 8 år.
        {
            return baseRER * 1.1m; // Seniorhunde får en lille justering.
        }

        return baseRER;
    }

    public decimal GetActivityMultiplier(string activityDuration, int ageInMonths)
    {
        // Aktivitet gemmes som tekst, fx "30m" eller "120m", og laves her om til minutter.
        var durationInMinutes = ParseActivityDuration(activityDuration);
        
        // Maks 8 timer, så meget høje tal ikke giver ekstreme kalorieberegninger.
        durationInMinutes = Math.Min(durationInMinutes, 480);
        
        var baseMultiplier = durationInMinutes switch
        {
            <= 30 => 1.2m,
            <= 60 => 1.5m,
            <= 120 => 1.8m,
            <= 240 => 2.0m,
            _ => 2.5m
        };

        // Hvalpe får en ekstra faktor, fordi de typisk har højere energibehov.
        if (ageInMonths < 12)
        {
            return baseMultiplier * 1.2m;
        }

        return baseMultiplier;
    }

    private int ParseActivityDuration(string duration)
    {
        // Fallback gør, at appen stadig kan beregne noget hvis teksten ikke kan læses.
        if (string.IsNullOrEmpty(duration))
            return 60; // Standardværdi: 1 time.

        var totalMinutes = 0;
        var parsedAny = false;
        var parts = duration.ToLower().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var part in parts)
        {
            if (part.EndsWith("h"))
            {
                if (int.TryParse(part.Replace("h", ""), out var hours))
                {
                    totalMinutes += hours * 60;
                    parsedAny = true;
                }
            }
            else if (part.EndsWith("m"))
            {
                if (int.TryParse(part.Replace("m", ""), out var minutes))
                {
                    totalMinutes += minutes;
                    parsedAny = true;
                }
            }
        }

        return parsedAny ? totalMinutes : 60; // Standardværdi hvis parsing fejler.
    }

    private string GetBreedAdjustment(string breed)
    {
        var lowerBreed = breed.ToLower();

        // Race-anbefalingerne er simple tekstregler, som er nemme at udvide senere.
        if (lowerBreed.Contains("chihuahua") || lowerBreed.Contains("yorkshire") || 
            lowerBreed.Contains("pomeranian") || lowerBreed.Contains("toy"))
        {
            return "Small Breed - Higher metabolism, feed premium quality food";
        }

        if (lowerBreed.Contains("labrador") || lowerBreed.Contains("golden") || 
            lowerBreed.Contains("german shepherd") || lowerBreed.Contains("great dane") ||
            lowerBreed.Contains("rottweiler"))
        {
            return "Large Breed - Monitor for weight, adjust portions carefully";
        }

        return "Standard breed guidelines apply";
    }

    private string GenerateFeedingNotes(Dog dog, decimal dailyCalories)
    {
        // Noterne sendes til frontend som kort forklaring på beregningen.
        var notes = $"Daily calorie recommendation: {dailyCalories:F0} kcal/day. ";
        
        if (dog.AgeInMonths < 12)
        {
            notes += "Puppy diet: Feed 3-4 times daily with growth-formula food. ";
        }
        else if (dog.AgeInMonths > 96)
        {
            notes += "Senior diet: Consider lower-calorie, joint-supporting food. ";
        }

        return notes;
    }

    private async Task<Dog?> GetUserDogAsync(int dogId, int userId)
    {
        // Lille helper så ejerskabsfilteret ikke gentages forkert flere steder.
        return await _context.Dogs.FirstOrDefaultAsync(d => d.Id == dogId && d.UserId == userId);
    }
}
