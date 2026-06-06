
using HFilesMedicalAPI.Data;
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Interfaces;
using HFilesMedicalAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HFilesMedicalAPI.Repositories
{
    public class FileRepository : IFileRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public FileRepository(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<MedicalFile> UploadFileAsync(UploadMedicalFileDto dto)
        {
            try
            {
                var uploadPath = Path.Combine(_environment.ContentRootPath, "Uploads", "MedicalFiles");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var uniqueFileName = $"{Guid.NewGuid()}_{DateTime.Now:yyyyMMddHHmmss}_{dto.File.FileName}";
                var relativePath = Path.Combine("Uploads", "MedicalFiles", uniqueFileName);
                var physicalPath = Path.Combine(_environment.ContentRootPath, relativePath);

                using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                var medicalFile = new MedicalFile
                {
                    UserId = dto.UserId,
                    FileType = dto.FileType,
                    FileName = string.IsNullOrEmpty(dto.FileName) ? dto.File.FileName : dto.FileName,
                    FilePath = relativePath.Replace("\\", "/"),
                    UploadDate = DateTime.Now
                };

                _context.MedicalFiles.Add(medicalFile);
                await _context.SaveChangesAsync();

                return medicalFile;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading file: {ex.Message}", ex);
            }
        }

        public async Task<List<MedicalFile>> GetFilesAsync(int userId)
        {
            return await _context.MedicalFiles
                .Where(f => f.UserId == userId && !f.IsDeleted)
                .OrderByDescending(f => f.UploadDate)
                .ToListAsync();
        }

        public async Task<MedicalFile?> GetFileByIdAsync(int fileId, int userId)
        {
            return await _context.MedicalFiles
                .FirstOrDefaultAsync(f => f.Id == fileId && f.UserId == userId && !f.IsDeleted);
        }

        public async Task<bool> DeleteFileAsync(int fileId, int userId)
        {
            var file = await GetFileByIdAsync(fileId, userId);
            if (file == null)
                return false;


            file.IsDeleted = true;
            file.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<byte[]> GetFileContentAsync(string filePath)
        {
            var fullPath = Path.Combine(_environment.ContentRootPath, filePath.Replace("/", "\\"));

            if (!File.Exists(fullPath))
                throw new FileNotFoundException("File not found");

            return await File.ReadAllBytesAsync(fullPath);
        }
    }
}