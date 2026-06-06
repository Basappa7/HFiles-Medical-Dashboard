
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HFilesMedicalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IFileRepository _fileRepository;

        public FileController(IFileRepository fileRepository)
        {
            _fileRepository = fileRepository;
        }

        private int? GetCurrentUserId()
        {
            return HttpContext.Session.GetInt32("UserId");
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] UploadMedicalFileDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Please login first" });
                }

                if (dto.File == null)
                {
                    return BadRequest(new { message = "Please select a file" });
                }

                string[] allowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png" };
                string extension = Path.GetExtension(dto.File.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Only PDF, JPG, JPEG and PNG files are allowed" });
                }

                dto.UserId = userId.Value;

                var result = await _fileRepository.UploadFileAsync(dto);

                return Ok(new { message = "File uploaded successfully", file = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("my-files")]
        public async Task<IActionResult> GetMyFiles()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Please login first" });
            }

            var files = await _fileRepository.GetFilesAsync(userId.Value);
            return Ok(files);
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Please login first" });
            }

            var file = await _fileRepository.GetFileByIdAsync(id, userId.Value);
            if (file == null)
            {
                return NotFound(new { message = "File not found" });
            }

            var fileBytes = await _fileRepository.GetFileContentAsync(file.FilePath);
            var contentType = GetContentType(file.FilePath);

            return File(fileBytes, contentType, file.FileName);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "Please login first" });
            }

            bool result = await _fileRepository.DeleteFileAsync(id, userId.Value);

            if (!result)
            {
                return NotFound(new { message = "File not found" });
            }

            return Ok(new { message = "File deleted successfully" });
        }

        private string GetContentType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLower();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
        }
    }
}