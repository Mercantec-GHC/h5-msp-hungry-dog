using HungryDogApi.DTOs;
using HungryDogApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HungryDogApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
// DogsController eksponerer CRUD for hunde, men kun for den bruger der ejer dem.
public class DogsController : ControllerBase
{
    private readonly IDogService _dogService;

    public DogsController(IDogService dogService)
    {
        _dogService = dogService;
    }

    // JWT-claimet er den simple kobling mellem requesten og den indloggede bruger.
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<ActionResult<List<DogDto>>> GetDogs()
    {
        // Returnerer kun hunde for den aktuelle bruger.
        var dogs = await _dogService.GetUserDogsAsync(GetUserId());
        return Ok(dogs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DogDto>> GetDog(int id)
    {
        var dog = await _dogService.GetDogAsync(id, GetUserId());
        return dog == null ? NotFound() : Ok(dog);
    }

    [HttpPost]
    public async Task<ActionResult<DogDto>> CreateDog(CreateDogRequest request)
    {
        // CreatedAtAction giver klienten både data og placeringen af den nye ressource.
        var dog = await _dogService.CreateDogAsync(request, GetUserId());
        return CreatedAtAction(nameof(GetDog), new { id = dog.Id }, dog);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DogDto>> UpdateDog(int id, UpdateDogRequest request)
    {
        var dog = await _dogService.UpdateDogAsync(id, request, GetUserId());
        return dog == null ? NotFound() : Ok(dog);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDog(int id)
    {
        var success = await _dogService.DeleteDogAsync(id, GetUserId());
        return success ? NoContent() : NotFound();
    }
}
