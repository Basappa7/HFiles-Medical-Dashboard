using System.ComponentModel.DataAnnotations;

namespace HFilesMedicalAPI.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public string Email { get; set; }

        public string Gender { get; set; }

        public string PhoneNumber { get; set; }

        [Required]
        public string Password { get; set; }

        public string? ProfileImage { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedAt { get; set; }
        
    }
}
