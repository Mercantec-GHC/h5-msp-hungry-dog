using HungryDogApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HungryDogApi.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260521000002_AddMealNameToMealLogs")]
    public partial class AddMealNameToMealLogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MealName",
                table: "MealLogs",
                type: "text",
                nullable: false,
                defaultValue: "Breakfast");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MealName",
                table: "MealLogs");
        }
    }
}
