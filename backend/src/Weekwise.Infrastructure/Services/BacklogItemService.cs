using AutoMapper;
using Weekwise.Core.DTOs.BacklogItem;
using Weekwise.Core.Entities;
using Weekwise.Core.Enums;
using Weekwise.Core.Interfaces;

namespace Weekwise.Infrastructure.Services;

public class BacklogItemService : IBacklogItemService
{
    private readonly IBacklogItemRepository _repo;
    private readonly IWorkCommitmentRepository _commitmentRepo;
    private readonly IMapper _mapper;

    public BacklogItemService(
        IBacklogItemRepository repo,
        IWorkCommitmentRepository commitmentRepo,
        IMapper mapper)
    {
        _repo = repo;
        _commitmentRepo = commitmentRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<BacklogItemDto>> GetActiveItemsAsync(ItemCategory? category)
    {
        IEnumerable<BacklogItem> items;
        if (category.HasValue)
            items = await _repo.GetByCategoryAsync(category.Value);
        else
            items = await _repo.GetActiveItemsAsync();

        return _mapper.Map<IEnumerable<BacklogItemDto>>(items);
    }

    public async Task<BacklogItemDto?> GetByIdAsync(Guid id)
    {
        var item = await _repo.GetByIdAsync(id);
        return item == null ? null : _mapper.Map<BacklogItemDto>(item);
    }

    public async Task<BacklogItemDto> CreateAsync(CreateBacklogItemDto dto)
    {
        if (dto.EstimatedHours <= 0)
            throw new InvalidOperationException("Estimated hours must be greater than zero.");

        var item = _mapper.Map<BacklogItem>(dto);
        item.Id = Guid.NewGuid();

        await _repo.AddAsync(item);
        return _mapper.Map<BacklogItemDto>(item);
    }

    public async Task<BacklogItemDto> UpdateAsync(Guid id, UpdateBacklogItemDto dto)
    {
        var item = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Backlog item with ID {id} not found.");

        if (dto.EstimatedHours <= 0)
            throw new InvalidOperationException("Estimated hours must be greater than zero.");

        item.Title = dto.Title;
        item.Description = dto.Description;
        item.Category = dto.Category;
        item.EstimatedHours = dto.EstimatedHours;

        await _repo.UpdateAsync(item);
        return _mapper.Map<BacklogItemDto>(item);
    }

    public async Task DeleteAsync(Guid id)
    {
        var item = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Backlog item with ID {id} not found.");

        var commitments = await _commitmentRepo.FindAsync(c => c.BacklogItemId == id);
        if (commitments.Any())
            throw new InvalidOperationException("Cannot delete a backlog item that has active work commitments.");

        await _repo.DeleteAsync(item);
    }

    public async Task<BacklogItemDto> ArchiveAsync(Guid id)
    {
        var item = await _repo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Backlog item with ID {id} not found.");

        item.IsArchived = true;
        await _repo.UpdateAsync(item);
        return _mapper.Map<BacklogItemDto>(item);
    }
}
