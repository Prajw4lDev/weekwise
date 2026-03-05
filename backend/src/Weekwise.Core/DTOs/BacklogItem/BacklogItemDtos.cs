using Weekwise.Core.Enums;

namespace Weekwise.Core.DTOs.BacklogItem;

public class CreateBacklogItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ItemCategory Category { get; set; }
    public double EstimatedHours { get; set; }
}

public class UpdateBacklogItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ItemCategory Category { get; set; }
    public double EstimatedHours { get; set; }
}

public class BacklogItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ItemCategory Category { get; set; }
    public double EstimatedHours { get; set; }
    public bool IsArchived { get; set; }
}
