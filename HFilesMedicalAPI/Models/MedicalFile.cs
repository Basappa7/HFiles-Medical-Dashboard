namespace HFilesMedicalAPI.Models
{
    public class MedicalFile
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string FileType { get; set; }

        public string FileName { get; set; }

        public string FilePath { get; set; }

        public DateTime UploadDate { get; set; }

        public User User { get; set; }
        public bool IsDeleted { get; set; } = false;  
        public DateTime? DeletedAt { get; set; }
    }
}
