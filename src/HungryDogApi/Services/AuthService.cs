using HungryDogApi.Auth;
using HungryDogApi.Data;
using HungryDogApi.DTOs;
using HungryDogApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace HungryDogApi.Services;

// Interface gør controlleren uafhængig af den konkrete AuthService-klasse.
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserDto?> GetUserAsync(int userId);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Email bruges som unikt login, derfor stoppes dubletter før brugeren oprettes.
        var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
            return new AuthResponse { Success = false, Message = "Email already registered" };

        var user = new User
        {
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PasswordHash = HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Brugeren får token med det samme, så frontend kan logge ind efter registrering.
        var token = _tokenService.GenerateToken(user);
        return new AuthResponse
        {
            Success = true,
            Message = "Registration successful",
            Token = token,
            User = new UserDto { Id = user.Id, Email = user.Email, FirstName = user.FirstName, LastName = user.LastName }
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        // Samme fejlbesked for manglende bruger og forkert kodeord lækker færre detaljer.
        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            return new AuthResponse { Success = false, Message = "Invalid credentials" };

        var token = _tokenService.GenerateToken(user);
        return new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = new UserDto { Id = user.Id, Email = user.Email, FirstName = user.FirstName, LastName = user.LastName }
        };
    }

    public async Task<UserDto?> GetUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user == null ? null : ToDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return null;

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            return null;

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        await _db.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return new AuthResponse { Success = false, Message = "User not found" };

        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return new AuthResponse { Success = false, Message = "Current password is wrong" };

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return new AuthResponse { Success = false, Message = "New password must be at least 6 characters" };

        // Kun hash gemmes i databasen, aldrig adgangskoden i klar tekst.
        user.PasswordHash = HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            Success = true,
            Message = "Password changed",
            User = ToDto(user)
        };
    }

    private static string HashPassword(string password)
    {
        // Simpel hashing til skoleprojektet. I en rigtig produktion-app bør man bruge salted hash, fx BCrypt eller ASP.NET Identity.
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }

    private static UserDto ToDto(User user)
    {
        // DTO'en udelader PasswordHash, så den aldrig sendes til frontend.
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
    }
}
