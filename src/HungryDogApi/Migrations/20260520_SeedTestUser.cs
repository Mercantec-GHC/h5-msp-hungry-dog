using HungryDogApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HungryDogApi.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260520000100_SeedTestUser")]
    public partial class SeedTestUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO ""Users"" (""Email"", ""PasswordHash"", ""FirstName"", ""LastName"", ""CreatedAt"")
                VALUES ('test@test.com', 'in5DNuCic5I5SCATT1mke2dxMSUjDTycywJvcthCUnY=', 'Test', 'User', NOW());
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM ""Users"" WHERE ""Email"" = 'test@test.com';
            ");
        }
    }
}
