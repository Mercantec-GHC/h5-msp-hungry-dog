namespace HungryDogApi.Models;

// WeightRecord gemmer én vægtmåling for en hund på et bestemt tidspunkt.
public class WeightRecord
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public decimal Weight { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    
    public Dog Dog { get; set; } = null!;
}
