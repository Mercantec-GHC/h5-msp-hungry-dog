using HungryDogApi.Data;
using HungryDogApi.DTOs;
using HungryDogApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HungryDogApi.Services;

// Interface gør hunde-logikken nem at udskifte eller teste uden controlleren.
public interface IDogService
{
    Task<List<DogDto>> GetUserDogsAsync(int userId);
    Task<DogDto?> GetDogAsync(int dogId, int userId);
    Task<DogDto> CreateDogAsync(CreateDogRequest request, int userId);
    Task<DogDto?> UpdateDogAsync(int dogId, UpdateDogRequest request, int userId);
    Task<bool> DeleteDogAsync(int dogId, int userId);
}

public class DogService : IDogService
{
    private readonly AppDbContext _db;

    public DogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<DogDto>> GetUserDogsAsync(int userId)
    {
        // Projektionen til DogDto sikrer, at API'et kun sender de felter frontend skal bruge.
        return await _db.Dogs
            .Where(d => d.UserId == userId)
            .Select(d => new DogDto
            {
                Id = d.Id,
                Name = d.Name,
                Breed = d.Breed,
                CurrentWeight = d.CurrentWeight,
                AgeInMonths = d.AgeInMonths,
                DailyActivityDuration = d.DailyActivityDuration,
            })
            .ToListAsync();
    }

    public async Task<DogDto?> GetDogAsync(int dogId, int userId)
    {
        // userId i filteret er selve adgangskontrollen for hundedata.
        var dog = await _db.Dogs.FirstOrDefaultAsync(d => d.Id == dogId && d.UserId == userId);
        if (dog == null) return null;

        return ToDto(dog);
    }

    public async Task<DogDto> CreateDogAsync(CreateDogRequest request, int userId)
    {
        // Negative tal rettes til 0, så databasen ikke får ugyldige basisværdier.
        var currentWeight = Math.Max(request.CurrentWeight, 0);

        var dog = new Dog
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Breed = string.IsNullOrWhiteSpace(request.Breed) ? "Unknown" : request.Breed.Trim(),
            CurrentWeight = currentWeight,
            AgeInMonths = Math.Max(request.AgeInMonths, 0),
            DailyActivityDuration = string.IsNullOrWhiteSpace(request.DailyActivityDuration)
                ? "30m"
                : request.DailyActivityDuration.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Dogs.Add(dog);

        // Første vægt gemmes også som historik, så grafen har et startpunkt.
        dog.WeightRecords.Add(new WeightRecord
        {
            Weight = dog.CurrentWeight,
            RecordedAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();

        return ToDto(dog);
    }

    public async Task<DogDto?> UpdateDogAsync(int dogId, UpdateDogRequest request, int userId)
    {
        // WeightRecords inkluderes, fordi en vægtændring også skal gemmes som historik.
        var dog = await _db.Dogs
            .Include(d => d.WeightRecords)
            .FirstOrDefaultAsync(d => d.Id == dogId && d.UserId == userId);

        if (dog == null) return null;

        var newWeight = Math.Max(request.CurrentWeight, 0);
        var weightChanged = dog.CurrentWeight != newWeight;

        dog.Name = string.IsNullOrWhiteSpace(request.Name) ? dog.Name : request.Name.Trim();
        dog.Breed = string.IsNullOrWhiteSpace(request.Breed) ? "Unknown" : request.Breed.Trim();
        dog.CurrentWeight = newWeight;
        dog.AgeInMonths = Math.Max(request.AgeInMonths, 0);
        dog.DailyActivityDuration = string.IsNullOrWhiteSpace(request.DailyActivityDuration)
            ? "30m"
            : request.DailyActivityDuration.Trim();

        if (weightChanged)
        {
            // Når vægten ændres på profilen, gemmes ændringen også i vægthistorikken.
            dog.WeightRecords.Add(new WeightRecord
            {
                Weight = dog.CurrentWeight,
                RecordedAt = DateTime.UtcNow,
            });
        }

        await _db.SaveChangesAsync();
        return ToDto(dog);
    }

    public async Task<bool> DeleteDogAsync(int dogId, int userId)
    {
        // Sletning bruger også userId, så en bruger ikke kan slette andres hunde.
        var dog = await _db.Dogs.FirstOrDefaultAsync(d => d.Id == dogId && d.UserId == userId);
        if (dog == null) return false;

        _db.Dogs.Remove(dog);
        await _db.SaveChangesAsync();
        return true;
    }

    private static DogDto ToDto(Dog dog)
    {
        // Samlet mapping holder controllerne fri for model-detaljer.
        return new DogDto
        {
            Id = dog.Id,
            Name = dog.Name,
            Breed = dog.Breed,
            CurrentWeight = dog.CurrentWeight,
            AgeInMonths = dog.AgeInMonths,
            DailyActivityDuration = dog.DailyActivityDuration,
        };
    }
}
