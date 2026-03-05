using Weekwise.Core.Enums;

namespace Weekwise.Core.DTOs.Progress;

public class UpdateProgressDto
{
    public double HoursCompleted { get; set; }
    public TaskItemStatus Status { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class ProgressUpdateDto
{
    public Guid Id { get; set; }
    public Guid WorkCommitmentId { get; set; }
    public double HoursCompleted { get; set; }
    public TaskItemStatus Status { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
}
