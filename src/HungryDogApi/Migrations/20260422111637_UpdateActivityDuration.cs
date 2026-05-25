using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HungryDogApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateActivityDuration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityLevel",
                table: "Dogs");

            migrationBuilder.AddColumn<string>(
                name: "DailyActivityDuration",
                table: "Dogs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyActivityDuration",
                table: "Dogs");

            migrationBuilder.AddColumn<int>(
                name: "ActivityLevel",
                table: "Dogs",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
