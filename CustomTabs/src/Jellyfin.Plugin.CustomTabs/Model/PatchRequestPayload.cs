using System.Text.Json.Serialization;

namespace Jellyfin.Plugin.CustomTabs.Model
{
    public class PatchRequestPayload
    {
        [JsonPropertyName("contents")]
        public string? Contents { get; set; }
    }
}