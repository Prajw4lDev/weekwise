using Weekwise.Core.Entities;
using Weekwise.Core.Enums;

namespace Weekwise.Core.Interfaces;

public interface IBacklogItemRepository : IRepository<BacklogItem>
{
    Task<IEnumerable<BacklogItem>> GetActiveItemsAsync();
    Task<IEnumerable<BacklogItem>> GetByCategoryAsync(ItemCategory category);
}
