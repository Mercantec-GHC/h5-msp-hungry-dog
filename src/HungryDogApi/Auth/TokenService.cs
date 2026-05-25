using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HungryDogApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace HungryDogApi.Auth;

public interface ITokenService
{
    string GenerateToken(User user);
}

// TokenService pakker JWT-oprettelse ind, så resten af appen ikke kender signeringsdetaljerne.
public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(User user)
    {
        // Secret, issuer og audience læses fra konfiguration, så de kan skiftes uden kodeændringer.
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "default-secret-key-minimum-32-chars-long"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Claims er de få brugeroplysninger API'et senere kan læse ud fra token.
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "HungryDogApi",
            audience: _config["Jwt:Audience"] ?? "HungryDogClient",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        // Handleren laver token-objektet om til den tekststreng frontend gemmer.
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
