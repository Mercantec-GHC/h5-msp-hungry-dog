namespace HungryDogApi.DTOs;

// Requesten indeholder kun DogId, fordi beregningen henter resten fra databasen.
public class CalculateFeedingNeedsRequest
{
    public int DogId { get; set; }
}

public class FeedingRecommendationDto
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public decimal DailyCaloriesNeeded { get; set; }
    public decimal RestingEnergyExpenditure { get; set; }
    public decimal ActivityMultiplier { get; set; }
    public string BreedAdjustment { get; set; } = null!;
    public string Notes { get; set; } = null!;
    public DateTime CalculatedAt { get; set; }
    public DateTime NextReviewDate { get; set; }
}

// FeedingDetailsDto samler hundedata og nyeste anbefaling i ét svar.
public class FeedingDetailsDto
{
    public string DogName { get; set; } = null!;
    public decimal Weight { get; set; }
    public int AgeInMonths { get; set; }
    public string DailyActivityDuration { get; set; } = null!; // Fx "30m" eller "120m".
    public decimal DailyCaloriesNeeded { get; set; }
    public decimal RestingEnergyExpenditure { get; set; }
    public decimal ActivityMultiplier { get; set; }
    public string FeedingGuide { get; set; } = null!;
    public DateTime CalculatedAt { get; set; }
}

public class CreateMealLogRequest
{
    public int DogId { get; set; }
    public string MealName { get; set; } = "Breakfast";
    public string AmountEaten { get; set; } = "All";
}

public class MealLogDto
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public string MealName { get; set; } = "Breakfast";
    public string AmountEaten { get; set; } = "All";
    public DateTime LoggedAt { get; set; }
}
