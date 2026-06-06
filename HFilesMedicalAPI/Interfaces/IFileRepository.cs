
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Models;

namespace HFilesMedicalAPI.Interfaces
{
    public interface IFileRepository
    {
        Task<MedicalFile> UploadFileAsync(UploadMedicalFileDto dto);
        Task<List<MedicalFile>> GetFilesAsync(int userId);
        Task<MedicalFile?> GetFileByIdAsync(int fileId, int userId);
        Task<bool> DeleteFileAsync(int fileId, int userId);
        Task<byte[]> GetFileContentAsync(string filePath);
    }
}
