using Weekwise.Core.DTOs.BacklogItem;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Interfaces;

public interface IBacklogItemService
{
    Task<IEnumerable<BacklogItemDto>> GetActiveItemsAsync(ItemCategory? category);
    Task<BacklogItemDto?> GetByIdAsync(Guid id);
    Task<BacklogItemDto> CreateAsync(CreateBacklogItemDto dto);
    Task<BacklogItemDto> UpdateAsync(Guid id, UpdateBacklogItemDto dto);
    Task DeleteAsync(Guid id);
    Task<BacklogItemDto> ArchiveAsync(Guid id);
}
