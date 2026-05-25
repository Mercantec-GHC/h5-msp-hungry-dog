using HungryDogApi.Data;
using HungryDogApi.DTOs;
using HungryDogApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HungryDogApi.Controllers;

[ApiController]
[Route("api/dogs/{dogId:int}/notes")]
[Authorize]
// Noter ligger under en hund, så ruten starter med dogId og arver hundens ejerskab.
public class DogNotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DogNotesController(AppDbContext context)
    {
        _context = context;
    }

    // Alle note-kald tjekker først, at hunden tilhører den indloggede bruger.
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<ActionResult<List<DogNoteDto>>> GetNotes(int dogId)
    {
        var userId = GetUserId();
        // Ejerskabstjekket forhindrer, at en bruger kan læse noter på en andens hund.
        var dogExists = await _context.Dogs.AnyAsync(d => d.Id == dogId && d.UserId == userId);
        if (!dogExists)
            return NotFound(new { message = $"Dog with id {dogId} not found" });

        // De nyeste noter vises først, og listen holdes kort til mobilvisningen.
        var notes = await _context.DogNotes
            .Where(note => note.DogId == dogId)
            .OrderByDescending(note => note.CreatedAt)
            .Take(20)
            .Select(note => new DogNoteDto
            {
                Id = note.Id,
                DogId = note.DogId,
                Text = note.Text,
                CreatedAt = note.CreatedAt,
            })
            .ToListAsync();

        return Ok(notes);
    }

    [HttpPost]
    public async Task<ActionResult<DogNoteDto>> AddNote(int dogId, CreateDogNoteRequest request)
    {
        var userId = GetUserId();
        var dogExists = await _context.Dogs.AnyAsync(d => d.Id == dogId && d.UserId == userId);
        if (!dogExists)
            return NotFound(new { message = $"Dog with id {dogId} not found" });

        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { message = "Note text is required" });

        // Trim gemmes i databasen, så tomme mellemrum ikke bliver en del af noten.
        var note = new DogNote
        {
            DogId = dogId,
            Text = request.Text.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _context.DogNotes.Add(note);
        await _context.SaveChangesAsync();

        return Ok(new DogNoteDto
        {
            Id = note.Id,
            DogId = note.DogId,
            Text = note.Text,
            CreatedAt = note.CreatedAt,
        });
    }

    [HttpDelete("{noteId:int}")]
    public async Task<IActionResult> DeleteNote(int dogId, int noteId)
    {
        var userId = GetUserId();
        var note = await _context.DogNotes
            .Include(n => n.Dog)
            .FirstOrDefaultAsync(n => n.Id == noteId && n.DogId == dogId && n.Dog.UserId == userId);

        if (note == null)
            return NotFound();

        _context.DogNotes.Remove(note);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
