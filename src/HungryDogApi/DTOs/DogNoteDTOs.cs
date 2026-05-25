namespace HungryDogApi.DTOs;

public class CreateDogNoteRequest
{
    public string Text { get; set; } = "";
}

public class DogNoteDto
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public string Text { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
