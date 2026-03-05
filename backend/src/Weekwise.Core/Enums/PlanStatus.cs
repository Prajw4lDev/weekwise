namespace Weekwise.Core.Enums;

/// <summary>
/// Lifecycle status of a weekly plan.
/// </summary>
public enum PlanStatus
{
    /// <summary>Plan created, awaiting member selection and percentage config.</summary>
    Setup = 0,

    /// <summary>Members are picking backlog items and assigning hours.</summary>
    Planning = 1,

    /// <summary>Plan is locked — only progress updates allowed.</summary>
    Frozen = 2,

    /// <summary>Week is finished and archived.</summary>
    Completed = 3,

    /// <summary>Plan was cancelled before completion.</summary>
    Cancelled = 4
}
