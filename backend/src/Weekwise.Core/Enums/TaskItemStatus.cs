namespace Weekwise.Core.Enums;

/// <summary>
/// Status of an individual work commitment / task.
/// Named TaskItemStatus to avoid conflict with System.Threading.Tasks.TaskStatus.
/// </summary>
public enum TaskItemStatus
{
    /// <summary>Work has not started yet.</summary>
    NotStarted = 0,

    /// <summary>Work is currently in progress.</summary>
    InProgress = 1,

    /// <summary>Work is completed.</summary>
    Done = 2,

    /// <summary>Work is blocked by a dependency or issue.</summary>
    Blocked = 3
}
