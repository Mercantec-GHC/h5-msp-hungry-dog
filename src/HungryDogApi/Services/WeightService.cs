using HungryDogApi.Data;
using HungryDogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HungryDogApi.Services;

// Interface samler alt omkring vægt, så controlleren ikke arbejder direkte mod databasen.
public interface IWeightService
{
    Task<WeightRecord> AddWeightRecordAsync(int dogId, int userId, decimal weight, DateTime? recordedAt = null);
    Task<List<WeightRecord>> GetWeightHistoryAsync(int dogId, int userId, int months = 12);
    Task<decimal?> CalculateWeightTrendAsync(int dogId, int userId);
    Task<string> GetWeightStatusAsync(int dogId, int userId);
}

public class WeightService : IWeightService
{
    private readonly AppDbContext _context;

    public WeightService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<WeightRecord> AddWeightRecordAsync(int dogId, int userId, decimal weight, DateTime? recordedAt = null)
    {
        // Vægt må kun tilføjes til hunde, der tilhører den indloggede bruger.
        var dog = await GetUserDogAsync(dogId, userId);
        if (dog == null)
            throw new InvalidOperationException($"Dog with id {dogId} not found");

        var weightRecord = new WeightRecord
        {
            DogId = dogId,
            Weight = Math.Max(weight, 0),
            RecordedAt = recordedAt ?? DateTime.UtcNow
        };

        _context.WeightRecords.Add(weightRecord);
        // Den nyeste måling bliver også hundens aktuelle vægt.
        dog.CurrentWeight = weightRecord.Weight;
        
        await _context.SaveChangesAsync();
        return weightRecord;
    }

    public async Task<List<WeightRecord>> GetWeightHistoryAsync(int dogId, int userId, int months = 12)
    {
        // Ejerskab tjekkes før historikken læses.
        var dog = await GetUserDogAsync(dogId, userId);
        if (dog == null)
            throw new InvalidOperationException($"Dog with id {dogId} not found");

        var cutoffDate = DateTime.UtcNow.AddMonths(-months);
        
        return await _context.WeightRecords
            .Where(w => w.DogId == dogId && w.RecordedAt >= cutoffDate)
            .OrderBy(w => w.RecordedAt)
            .ToListAsync();
    }

    public async Task<decimal?> CalculateWeightTrendAsync(int dogId, int userId)
    {
        var records = await GetWeightHistoryAsync(dogId, userId, 3); // Seneste 3 måneder.
        
        if (records.Count < 2)
            return null;

        // Simpel trend: forskellen mellem første og sidste måling omregnet til pr. måned.
        var firstRecord = records.First();
        var lastRecord = records.Last();
        var daysDifference = (lastRecord.RecordedAt - firstRecord.RecordedAt).TotalDays;
        
        if (daysDifference == 0)
            return null;

        var weightChange = lastRecord.Weight - firstRecord.Weight;
        var daysInMonth = 30;
        var trendPerMonth = (weightChange / (decimal)daysDifference) * daysInMonth;
        
        return trendPerMonth;
    }

    public async Task<string> GetWeightStatusAsync(int dogId, int userId)
    {
        // Metoden er klar til senere udvidelse med fx "Over", "Under" eller "Stable".
        var dog = await GetUserDogAsync(dogId, userId);
        if (dog == null)
            throw new InvalidOperationException($"Dog with id {dogId} not found");

        return "Tracking";
    }

    private async Task<Dog?> GetUserDogAsync(int dogId, int userId)
    {
        // Fælles opslag der samtidig beskytter mod adgang til andres hunde.
        return await _context.Dogs.FirstOrDefaultAsync(d => d.Id == dogId && d.UserId == userId);
    }
}
