using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;
using Weekwise.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

// Controllers + JSON options (camelCase, string enums)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allow the Angular dev server on port 4200
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// EF Core — SQLite
builder.Services.AddDbContext<WeekwiseDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<ITeamMemberRepository, TeamMemberRepository>();
builder.Services.AddScoped<IBacklogItemRepository, BacklogItemRepository>();
builder.Services.AddScoped<IWeeklyPlanRepository, WeeklyPlanRepository>();
builder.Services.AddScoped<IWorkCommitmentRepository, WorkCommitmentRepository>();
builder.Services.AddScoped<IProgressUpdateRepository, ProgressUpdateRepository>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// TODO: Register Services (Level 5+)

var app = builder.Build();

// ---------------------------------------------------------------------------
// Middleware pipeline
// ---------------------------------------------------------------------------

// Swagger (available in all environments for now)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Weekwise API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAngular");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/", () => Results.Ok(new { status = "Weekwise API is running", version = "1.0.0" }));

app.Run();

// Make the Program class accessible for integration tests
public partial class Program { }
