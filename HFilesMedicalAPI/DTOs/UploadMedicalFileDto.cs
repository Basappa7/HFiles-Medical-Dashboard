namespace HFilesMedicalAPI.DTOs
{
    public class UploadMedicalFileDto
    {
        public int UserId { get; set; }

        public string FileType { get; set; }

        public string FileName { get; set; }

        public IFormFile File { get; set; }
    }
}
