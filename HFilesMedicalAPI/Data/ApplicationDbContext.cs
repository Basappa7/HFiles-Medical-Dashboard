using HFilesMedicalAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HFilesMedicalAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<MedicalFile> MedicalFiles { get; set; }
    }
}