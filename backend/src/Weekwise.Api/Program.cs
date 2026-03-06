```csharp
using Weekwise.Infrastructure.Data;
using Weekwise.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Text;
using Microsoft.OpenApi.Models;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// IMPORTANT: Bind to Azure App Service port
builder.WebHost.UseUrls("http://0.0.0.0:8080");

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

// Swagger / OpenAPI with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Weekwise API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Authentication Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            )
        };
    });

// CORS — allow everything for development/testing
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
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
builder.Services.AddScoped<IInvitationRepository, InvitationRepository>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

// Services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IInvitationService, InvitationService>();
builder.Services.AddScoped<ITeamMemberService, Weekwise.Infrastructure.Services.TeamMemberService>();
builder.Services.AddScoped<IBacklogItemService, Weekwise.Infrastructure.Services.BacklogItemService>();
builder.Services.AddScoped<IWeeklyPlanService, Weekwise.Infrastructure.Services.WeeklyPlanService>();
builder.Services.AddScoped<IProgressService, Weekwise.Infrastructure.Services.ProgressService>();
builder.Services.AddScoped<IDashboardService, Weekwise.Infrastructure.Services.DashboardService>();
builder.Services.AddScoped<IDataService, Weekwise.Infrastructure.Services.DataService>();

var app = builder.Build();

// ---------------------------------------------------------------------------
// Middleware pipeline
// ---------------------------------------------------------------------------

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Weekwise API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("index.html");

// Health check endpoint
app.MapGet("/", () => Results.Ok(new { status = "Weekwise API is running", version = "1.0.0" }));

// ---------------------------------------------------------------------------
// Initialize Database
// ---------------------------------------------------------------------------

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<WeekwiseDbContext>();
    context.Database.EnsureCreated();

    var dataService = scope.ServiceProvider.GetRequiredService<IDataService>();
    await dataService.SeedDemoDataAsync();
}

app.Run();

// Make the Program class accessible for integration tests
public partial class Program { }
```
