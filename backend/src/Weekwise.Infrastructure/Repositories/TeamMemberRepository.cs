using Microsoft.EntityFrameworkCore;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;
using Weekwise.Infrastructure.Data;

namespace Weekwise.Infrastructure.Repositories;

public class TeamMemberRepository : Repository<TeamMember>, ITeamMemberRepository
{
    public TeamMemberRepository(WeekwiseDbContext context) : base(context) { }

    public async Task<IEnumerable<TeamMember>> GetActiveMembersAsync()
        => await _dbSet.Where(m => m.IsActive).ToListAsync();

    public async Task<TeamMember?> GetLeadAsync()
        => await _dbSet.FirstOrDefaultAsync(m => m.Role == MemberRole.Lead && m.IsActive);
}
