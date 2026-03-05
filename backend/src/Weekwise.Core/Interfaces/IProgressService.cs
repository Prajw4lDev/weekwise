using Weekwise.Core.DTOs.Progress;

namespace Weekwise.Core.Interfaces;

public interface IProgressService
{
    Task<ProgressUpdateDto> UpdateProgressAsync(Guid commitmentId, UpdateProgressDto dto);
    Task<IEnumerable<ProgressUpdateDto>> GetHistoryAsync(Guid commitmentId);
    Task<ProgressUpdateDto?> GetLatestAsync(Guid commitmentId);
}
