using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Weekwise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BacklogItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    EstimatedHours = table.Column<double>(type: "REAL", nullable: false),
                    IsArchived = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BacklogItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    WeekStartDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ClientPercent = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    TechDebtPercent = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    RndPercent = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    TotalHours = table.Column<double>(type: "REAL", nullable: false, defaultValue: 0.0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    WeeklyPlanId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MemberId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanMembers_TeamMembers_MemberId",
                        column: x => x.MemberId,
                        principalTable: "TeamMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlanMembers_WeeklyPlans_WeeklyPlanId",
                        column: x => x.WeeklyPlanId,
                        principalTable: "WeeklyPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkCommitments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    WeeklyPlanId = table.Column<Guid>(type: "TEXT", nullable: false),
                    MemberId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BacklogItemId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CommittedHours = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkCommitments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkCommitments_BacklogItems_BacklogItemId",
                        column: x => x.BacklogItemId,
                        principalTable: "BacklogItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkCommitments_TeamMembers_MemberId",
                        column: x => x.MemberId,
                        principalTable: "TeamMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkCommitments_WeeklyPlans_WeeklyPlanId",
                        column: x => x.WeeklyPlanId,
                        principalTable: "WeeklyPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgressUpdates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    WorkCommitmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    HoursCompleted = table.Column<double>(type: "REAL", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgressUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgressUpdates_WorkCommitments_WorkCommitmentId",
                        column: x => x.WorkCommitmentId,
                        principalTable: "WorkCommitments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BacklogItems_Category",
                table: "BacklogItems",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_BacklogItems_IsArchived",
                table: "BacklogItems",
                column: "IsArchived");

            migrationBuilder.CreateIndex(
                name: "IX_PlanMembers_MemberId",
                table: "PlanMembers",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanMembers_WeeklyPlanId_MemberId",
                table: "PlanMembers",
                columns: new[] { "WeeklyPlanId", "MemberId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProgressUpdates_UpdatedAt",
                table: "ProgressUpdates",
                column: "UpdatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ProgressUpdates_WorkCommitmentId",
                table: "ProgressUpdates",
                column: "WorkCommitmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_Name",
                table: "TeamMembers",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyPlans_Status",
                table: "WeeklyPlans",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyPlans_WeekStartDate",
                table: "WeeklyPlans",
                column: "WeekStartDate");

            migrationBuilder.CreateIndex(
                name: "IX_WorkCommitments_BacklogItemId",
                table: "WorkCommitments",
                column: "BacklogItemId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkCommitments_MemberId",
                table: "WorkCommitments",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkCommitments_WeeklyPlanId_MemberId_BacklogItemId",
                table: "WorkCommitments",
                columns: new[] { "WeeklyPlanId", "MemberId", "BacklogItemId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanMembers");

            migrationBuilder.DropTable(
                name: "ProgressUpdates");

            migrationBuilder.DropTable(
                name: "WorkCommitments");

            migrationBuilder.DropTable(
                name: "BacklogItems");

            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "WeeklyPlans");
        }
    }
}
