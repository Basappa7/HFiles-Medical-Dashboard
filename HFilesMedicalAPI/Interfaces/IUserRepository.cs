
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Models;

namespace HFilesMedicalAPI.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> EmailExistsAsync(string email);
        Task RegisterAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int userId);  // ← ADD THIS
    }
}
