using HungryDogApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HungryDogApi.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260521000000_RemoveIdealWeight")]
    public partial class RemoveIdealWeight : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdealWeight",
                table: "Dogs");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "IdealWeight",
                table: "Dogs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
