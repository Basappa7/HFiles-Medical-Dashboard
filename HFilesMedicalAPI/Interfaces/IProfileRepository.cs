

using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Models;

namespace HFilesMedicalAPI.Interfaces
{
    public interface IProfileRepository
    {
        Task<User?> GetProfileAsync(int userId);
        Task<User?> UpdateProfileAsync(int userId, UpdateProfileDto dto);
        Task<User?> UpdateProfileImageAsync(int userId, string imagePath);
    }
}
