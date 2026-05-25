namespace HungryDogApi.Models;

// FeedingRecommendation gemmer resultatet af en foderberegning.
public class FeedingRecommendation
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public decimal DailyCaloriesNeeded { get; set; }
    public decimal RestingEnergyExpenditure { get; set; } // RER i kcal.
    public decimal ActivityMultiplier { get; set; }
    public string BreedAdjustment { get; set; } = "None";
    public string Notes { get; set; } = "";
    public DateTime CalculatedAt { get; set; } = DateTime.UtcNow;
    public DateTime NextReviewDate { get; set; }
    
    public Dog Dog { get; set; } = null!;
}
