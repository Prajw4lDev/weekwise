namespace Weekwise.Core.DTOs.WorkCommitment;

public class CreateCommitmentDto
{
    public Guid MemberId { get; set; }
    public Guid BacklogItemId { get; set; }
    public double CommittedHours { get; set; }
}

public class WorkCommitmentDto
{
    public Guid Id { get; set; }
    public Guid WeeklyPlanId { get; set; }
    public Guid MemberId { get; set; }
    public string MemberName { get; set; } = string.Empty;
    public Guid BacklogItemId { get; set; }
    public string BacklogItemTitle { get; set; } = string.Empty;
    public double CommittedHours { get; set; }
}
