using Microsoft.EntityFrameworkCore;
using HungryDogApi.Models;

namespace HungryDogApi.Data;

// AppDbContext er forbindelsen mellem API'et og databasen.
// Her registreres alle tabeller (DbSets) og relationer mellem modellerne.
public class AppDbContext : DbContext
{
    // Constructor der modtager database-konfiguration fra Program.cs
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Users-tabellen
    public DbSet<User> Users { get; set; } = null!;

    // Dogs-tabellen
    public DbSet<Dog> Dogs { get; set; } = null!;

    // Vægthistorik for hunde
    public DbSet<WeightRecord> WeightRecords { get; set; } = null!;

    // Foderanbefalinger til hunde
    public DbSet<FeedingRecommendation> FeedingRecommendations { get; set; } = null!;

    // Log over hundens måltider
    public DbSet<MealLog> MealLogs { get; set; } = null!;

    // Noter om hunden
    public DbSet<DogNote> DogNotes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Relationerne her sikrer både data-ejerskab og automatisk oprydning.
        // En bruger kan eje flere hunde.
        // Hvis brugeren slettes, slettes alle hundene automatisk.
        modelBuilder.Entity<Dog>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Email skal være unik i databasen,
        // så to brugere ikke kan registreres med samme email.
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // WeightRecord er knyttet til en bestemt hund.
        // Hvis hunden slettes, slettes vægthistorikken også.
        modelBuilder.Entity<WeightRecord>()
            .HasOne(w => w.Dog)
            .WithMany(d => d.WeightRecords)
            .HasForeignKey(w => w.DogId)
            .OnDelete(DeleteBehavior.Cascade);

        // FeedingRecommendation tilhører én hund.
        // Data fjernes automatisk hvis hunden slettes.
        modelBuilder.Entity<FeedingRecommendation>()
            .HasOne(f => f.Dog)
            .WithMany(d => d.FeedingRecommendations)
            .HasForeignKey(f => f.DogId)
            .OnDelete(DeleteBehavior.Cascade);

        // MealLog gemmer hundens måltider.
        // Måltidsdata slettes sammen med hunden.
        modelBuilder.Entity<MealLog>()
            .HasOne(m => m.Dog)
            .WithMany(d => d.MealLogs)
            .HasForeignKey(m => m.DogId)
            .OnDelete(DeleteBehavior.Cascade);

        // DogNote indeholder noter om hunden.
        // Noterne slettes automatisk når hunden slettes.
        modelBuilder.Entity<DogNote>()
            .HasOne(n => n.Dog)
            .WithMany(d => d.DogNotes)
            .HasForeignKey(n => n.DogId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
