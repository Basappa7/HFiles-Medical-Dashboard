
using HFilesMedicalAPI.Data;
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Interfaces;
using HFilesMedicalAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HFilesMedicalAPI.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public ProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetProfileAsync(int userId)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<User?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            user.Email = dto.Email;
            user.Gender = dto.Gender;
            user.PhoneNumber = dto.PhoneNumber;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> UpdateProfileImageAsync(int userId, string imagePath)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            user.ProfileImage = imagePath;
            await _context.SaveChangesAsync();
            return user;
        }
    }
}