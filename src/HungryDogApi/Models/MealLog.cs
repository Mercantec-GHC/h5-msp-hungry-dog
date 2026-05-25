namespace HungryDogApi.Models;

// MealLog viser hvad hunden spiste ved et måltid.
public class MealLog
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public string MealName { get; set; } = "Breakfast";
    public string AmountEaten { get; set; } = "All";
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

    public Dog Dog { get; set; } = null!;
}
