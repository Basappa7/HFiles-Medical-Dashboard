
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HFilesMedicalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IWebHostEnvironment _environment;

        public ProfileController(
            IProfileRepository profileRepository,
            IWebHostEnvironment environment)
        {
            _profileRepository = profileRepository;
            _environment = environment;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return Unauthorized(new { message = "Please login first" });

            var user = await _profileRepository.GetProfileAsync(userId.Value);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _profileRepository.GetProfileAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return Unauthorized(new { message = "Please login first" });

            var user = await _profileRepository.UpdateProfileAsync(userId.Value, dto);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadProfileImage(IFormFile profileImage)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
                return Unauthorized(new { message = "Please login first" });

            if (profileImage == null || profileImage.Length == 0)
                return BadRequest(new { message = "Please select an image" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(profileImage.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Only JPG, JPEG, PNG, GIF images are allowed" });

            var uploadPath = Path.Combine(_environment.ContentRootPath, "Uploads", "Profiles");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = $"user_{userId}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
            var relativePath = Path.Combine("Uploads", "Profiles", fileName);
            var physicalPath = Path.Combine(_environment.ContentRootPath, relativePath);

            using (var stream = new FileStream(physicalPath, FileMode.Create))
            {
                await profileImage.CopyToAsync(stream);
            }

            var imagePath = relativePath.Replace("\\", "/");
            var updatedUser = await _profileRepository.UpdateProfileImageAsync(userId.Value, imagePath);

            return Ok(new { message = "Profile image uploaded successfully", imagePath = imagePath, user = updatedUser });
        }
    }
}
