
using HFilesMedicalAPI.DTOs;
using HFilesMedicalAPI.Interfaces;
using HFilesMedicalAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HFilesMedicalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public AuthController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(SignupDto dto)
        {
            if (await _userRepository.EmailExistsAsync(dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            User user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedDate = DateTime.Now
            };

            await _userRepository.RegisterAsync(user);

            return Ok(new { message = "User registered successfully", userId = user.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            bool isValidPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);

            if (!isValidPassword)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserEmail", user.Email);
            HttpContext.Session.SetString("UserName", user.FullName);

            return Ok(new
            {
                message = "Login successful",
                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.Gender,
                    user.PhoneNumber
                }
            });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = HttpContext.Session.GetInt32("UserId");

            if (userId == null)
            {
                return Unauthorized(new { message = "Not logged in" });
            }

            var user = await _userRepository.GetByIdAsync(userId.Value);

            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Gender,
                user.PhoneNumber,
                user.ProfileImage
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("check-auth")]
        public IActionResult CheckAuth()
        {
            var userId = HttpContext.Session.GetInt32("UserId");

            if (userId == null)
            {
                return Unauthorized(new { isAuthenticated = false });
            }

            return Ok(new { isAuthenticated = true, userId = userId });
        }
    }
}
