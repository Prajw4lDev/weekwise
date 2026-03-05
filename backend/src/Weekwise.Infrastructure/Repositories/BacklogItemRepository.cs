using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Repositories;

public class BacklogItemRepository : Repository<BacklogItem>, IBacklogItemRepository
{
    public BacklogItemRepository(WeekwiseDbContext context) : base(context) { }

    public async Task<IEnumerable<BacklogItem>> GetActiveItemsAsync()
        => await _dbSet.Where(b => !b.IsArchived).ToListAsync();

    public async Task<IEnumerable<BacklogItem>> GetByCategoryAsync(ItemCategory category)
        => await _dbSet.Where(b => b.Category == category && !b.IsArchived).ToListAsync();
}
