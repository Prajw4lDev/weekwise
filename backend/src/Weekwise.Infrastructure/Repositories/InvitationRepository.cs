using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Repositories;

public class InvitationRepository : Repository<Invitation>, IInvitationRepository
{
    public InvitationRepository(WeekwiseDbContext context) : base(context)
    {
    }

    public async Task<Invitation?> GetByTokenAsync(string token)
    {
        return await _dbSet.FirstOrDefaultAsync(i => i.Token == token);
    }

    public async Task<Invitation?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(i => i.Email == email);
    }

    public async Task<IEnumerable<Invitation>> GetPendingInvitationsAsync()
    {
        return await _dbSet.Where(i => i.Status == InvitationStatus.Pending).ToListAsync();
    }
}
