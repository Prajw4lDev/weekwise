using AutoMapper;
using Weekwise.Core.DTOs.TeamMember;
using Weekwise.Core.DTOs.BacklogItem;
using Weekwise.Core.DTOs.WeeklyPlan;
using Weekwise.Core.DTOs.WorkCommitment;
using Weekwise.Core.DTOs.Progress;
using Weekwise.Core.Entities;

namespace Weekwise.Api.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ─── TeamMember ───
        CreateMap<Core.Entities.TeamMember, TeamMemberDto>();
        CreateMap<CreateTeamMemberDto, Core.Entities.TeamMember>();
        CreateMap<UpdateTeamMemberDto, Core.Entities.TeamMember>();

        // ─── BacklogItem ───
        CreateMap<Core.Entities.BacklogItem, BacklogItemDto>();
        CreateMap<CreateBacklogItemDto, Core.Entities.BacklogItem>();
        CreateMap<UpdateBacklogItemDto, Core.Entities.BacklogItem>();

        // ─── WeeklyPlan ───
        CreateMap<Core.Entities.WeeklyPlan, WeeklyPlanDto>()
            .ForMember(dest => dest.SelectedMemberIds,
                       opt => opt.MapFrom(src => src.PlanMembers.Select(pm => pm.MemberId).ToList()));

        // ─── WorkCommitment ───
        CreateMap<Core.Entities.WorkCommitment, WorkCommitmentDto>()
            .ForMember(dest => dest.MemberName,
                       opt => opt.MapFrom(src => src.Member != null ? src.Member.Name : string.Empty))
            .ForMember(dest => dest.BacklogItemTitle,
                       opt => opt.MapFrom(src => src.BacklogItem != null ? src.BacklogItem.Title : string.Empty));
        CreateMap<CreateCommitmentDto, Core.Entities.WorkCommitment>();

        // ─── ProgressUpdate ───
        CreateMap<Core.Entities.ProgressUpdate, ProgressUpdateDto>();
        CreateMap<UpdateProgressDto, Core.Entities.ProgressUpdate>();
    }
}
