using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HungryDogApi.Auth;
using HungryDogApi.Data;
using HungryDogApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Kobler API'et til PostgreSQL databasen via connection string i appsettings.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services holder forretningslogikken væk fra controllerne, så controllerne kan være simple.
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IDogService, DogService>();
builder.Services.AddScoped<IWeightService, WeightService>();
builder.Services.AddScoped<IFeedingService, FeedingService>();

// JWT bruges til at vise, hvilken bruger der er logget ind ved beskyttede API kald.
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "default-secret-key-minimum-32-chars-long";
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "HungryDogApi",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "HungryDogClient",
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// CORS er åben under projektarbejdet, så Expo/web-klienten kan kalde API'et lokalt.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Giver tydelige fejlbeskeder under udvikling i stedet for generiske 500-svar.
    app.UseDeveloperExceptionPage();
}

if (!app.Environment.IsDevelopment())
{
    // HTTPS tvinges kun uden for udvikling, fordi lokale Expo-kald bruger http.
    app.UseHttpsRedirection();
}

// Rækkefølgen betyder noget: CORS først, derefter login-token og adgangskontrol.
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Roden sender browseren videre til frontend, så et API-hit i browseren åbner appen.
app.MapGet("/", () => Results.Redirect("http://localhost:8081"));
app.MapControllers();

app.Run();
