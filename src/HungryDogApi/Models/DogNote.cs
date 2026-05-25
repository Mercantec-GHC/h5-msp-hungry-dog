namespace HungryDogApi.Models;

// DogNote er fritekstnoter brugeren kan gemme på en hund.
public class DogNote
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public string Text { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Dog Dog { get; set; } = null!;
}
