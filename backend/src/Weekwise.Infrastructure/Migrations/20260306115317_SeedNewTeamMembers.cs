using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Weekwise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedNewTeamMembers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "TeamMembers",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "TeamMembers",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "WeeklyCapacityHours",
                table: "TeamMembers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Invitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Token = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invitations", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "TeamMembers",
                columns: new[] { "Id", "Email", "IsActive", "Name", "PasswordHash", "Role", "WeeklyCapacityHours" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "prajwal@demo.com", true, "Prajwal Dinde", "seeded", "Admin", 40 },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "ajay@demo.com", true, "Ajay more", "seeded", "Member", 40 },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "om@demo.com", true, "Om Patil", "seeded", "Member", 40 },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "yash@demo.com", true, "Yash Gaikwad", "seeded", "Member", 40 },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "jay@demo.com", true, "Jay Sharma", "seeded", "Member", 40 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_Email",
                table: "Invitations",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_Token",
                table: "Invitations",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Invitations");

            migrationBuilder.DeleteData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.DropColumn(
                name: "Email",
                table: "TeamMembers");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "TeamMembers");

            migrationBuilder.DropColumn(
                name: "WeeklyCapacityHours",
                table: "TeamMembers");
        }
    }
}
