namespace HungryDogApi.Models;

// Dog er hovedmodellen for appens sundhedsdata.
public class Dog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Breed { get; set; } = null!;
    public decimal CurrentWeight { get; set; }
    public int AgeInMonths { get; set; }
    public string DailyActivityDuration { get; set; } = "1h"; // Fx "30m" eller "120m".
    public DateTime CreatedAt { get; set; }
    public ICollection<WeightRecord> WeightRecords { get; set; } = new List<WeightRecord>();
    public ICollection<FeedingRecommendation> FeedingRecommendations { get; set; } = new List<FeedingRecommendation>();
    public ICollection<MealLog> MealLogs { get; set; } = new List<MealLog>();
    public ICollection<DogNote> DogNotes { get; set; } = new List<DogNote>();
}
