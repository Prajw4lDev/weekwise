namespace Weekwise.Core.Enums;

/// <summary>
/// Role of a team member within the weekly planning cycle.
/// </summary>
public enum MemberRole
{
    /// <summary>A regular team member who plans and updates progress.</summary>
    Member = 0,

    /// <summary>The team lead who creates plans, freezes, and completes weeks.</summary>
    Lead = 1
}
