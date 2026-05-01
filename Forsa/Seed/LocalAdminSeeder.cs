using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Forsa.Seed
{
    public static class LocalAdminSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();

            const string adminRole = "Admin";
            const string adminEmail = "admin@forsa.com";
            const string adminPassword = "Admin@12345";

            if (!await roleManager.RoleExistsAsync(adminRole))
            {
                var roleResult = await roleManager.CreateAsync(new IdentityRole<int>(adminRole));
                ThrowIfFailed(roleResult, "Admin role creation failed");
            }

            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    FullName = "System Admin",
                    UserName = adminEmail,
                    NormalizedUserName = adminEmail.ToUpperInvariant(),
                    Email = adminEmail,
                    NormalizedEmail = adminEmail.ToUpperInvariant(),
                    EmailConfirmed = true,
                    PhoneNumber = "01000000000",
                    Location = "Local",
                    BirthDate = new DateTime(2000, 1, 1),
                    ProfilePicture = string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                var createResult = await userManager.CreateAsync(admin, adminPassword);
                ThrowIfFailed(createResult, "Admin user creation failed");
            }

            if (!await userManager.IsInRoleAsync(admin, adminRole))
            {
                var addRoleResult = await userManager.AddToRoleAsync(admin, adminRole);
                ThrowIfFailed(addRoleResult, "Admin role assignment failed");
            }
        }

        private static void ThrowIfFailed(IdentityResult result, string message)
        {
            if (result.Succeeded)
                return;

            var errors = string.Join(", ", result.Errors.Select(error => error.Description));
            throw new Exception($"{message}: {errors}");
        }
    }
}
