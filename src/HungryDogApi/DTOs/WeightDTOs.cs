namespace HungryDogApi.DTOs;

public class CreateWeightRecordRequest
{
    public int DogId { get; set; }
    public decimal Weight { get; set; }
    public DateTime? RecordedAt { get; set; }
}

public class WeightRecordDto
{
    public int Id { get; set; }
    public int DogId { get; set; }
    public decimal Weight { get; set; }
    public DateTime RecordedAt { get; set; }
}


public class WeightTrendDto
{
    public int DogId { get; set; }
    public string DogName { get; set; } = null!;
    public decimal CurrentWeight { get; set; }
    public decimal? WeightChangePerMonth { get; set; }
    public string WeightStatus { get; set; } = null!;
    public int RecordCount { get; set; }
}
