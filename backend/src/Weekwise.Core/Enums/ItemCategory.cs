namespace Weekwise.Core.Enums;

/// <summary>
/// Category for backlog items — maps to team budget allocation percentages.
/// </summary>
public enum ItemCategory
{
    /// <summary>Client-facing work.</summary>
    Client = 0,

    /// <summary>Technical debt and maintenance.</summary>
    TechDebt = 1,

    /// <summary>Research and development.</summary>
    RnD = 2
}
