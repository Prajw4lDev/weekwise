namespace Weekwise.Core.Interfaces;

public interface IDataService
{
    Task<object> ExportAllAsync();
    Task ImportAllAsync(string jsonData);
    Task SeedDemoDataAsync();
    Task ResetAllAsync();
}
