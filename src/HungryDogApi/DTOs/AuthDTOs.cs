namespace HungryDogApi.DTOs;

public class RegisterRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

// AuthResponse bruges både ved login, registrering og adgangskodeskift.
public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public string? Token { get; set; }
    public UserDto? User { get; set; }
}

// UserDto er den sikre bruger-visning uden PasswordHash.
public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
}

public class UpdateProfileRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public class DogDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Breed { get; set; } = null!;
    public decimal CurrentWeight { get; set; }
    public int AgeInMonths { get; set; }
    public string DailyActivityDuration { get; set; } = "30m";
}

public class CreateDogRequest
{
    public string Name { get; set; } = null!;
    public string Breed { get; set; } = null!;
    public decimal CurrentWeight { get; set; }
    public int AgeInMonths { get; set; }
    public string DailyActivityDuration { get; set; } = "30m";
}

public class UpdateDogRequest
{
    public string Name { get; set; } = null!;
    public string Breed { get; set; } = null!;
    public decimal CurrentWeight { get; set; }
    public int AgeInMonths { get; set; }
    public string DailyActivityDuration { get; set; } = "30m";
}
