using HungryDogApi.DTOs;
using HungryDogApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HungryDogApi.Controllers;

[ApiController]
[Route("api/[controller]")]
// AuthController samler bruger-flow: oprettelse, login, profil og adgangskode.
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        // Service-laget står for validering, hashing og token-generering.
        var result = await _authService.RegisterAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        // Forkert login returnerer Unauthorized, så klienten kan skelne det fra inputfejl.
        var result = await _authService.LoginAsync(request);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    // Bruger-id'et kommer fra JWT-tokenet og bruges til at holde data adskilt pr. bruger.
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var user = await _authService.GetUserAsync(GetUserId());
        return user == null ? NotFound() : Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile(UpdateProfileRequest request)
    {
        // Null betyder enten ugyldige felter eller at brugeren ikke blev fundet.
        var user = await _authService.UpdateProfileAsync(GetUserId(), request);
        return user == null ? BadRequest(new { message = "First name and last name are required" }) : Ok(user);
    }

    [Authorize]
    [HttpPut("password")]
    public async Task<ActionResult<AuthResponse>> ChangePassword(ChangePasswordRequest request)
    {
        var result = await _authService.ChangePasswordAsync(GetUserId(), request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
