using System.Reflection;
using Jellyfin.Data;
using Jellyfin.Database.Implementations.Enums;
using MediaBrowser.Controller.Collections;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.Movies;
using MediaBrowser.Controller.Library;
using MediaBrowser.Model.Entities;

namespace Jellyfin.Plugin.HomeScreenSections.Helpers;

public static class MiscExtensions
{
    public static IEnumerable<BoxSet> GetCollections(this ICollectionManager collectionManager, User user)
    {
        return collectionManager.GetType()
            .GetMethod("GetCollections", BindingFlags.Instance | BindingFlags.NonPublic)?
            .Invoke(collectionManager, new object?[]
            {
                user
            }) as IEnumerable<BoxSet> ?? Enumerable.Empty<BoxSet>();
    }

    public static bool IsMixedFolder(this VirtualFolderInfo folder, ILibraryManager libraryManager)
    {
        if (HomeScreenSectionsPlugin.Instance.CollectionFolderMixedStatus.TryGetValue(folder.Name, out bool mixedFolder))
        {
            return mixedFolder;
        }
        
        IReadOnlyList<BaseItem> collectionFolders = libraryManager.GetItemsResult(new InternalItemsQuery()
        {
            IncludeItemTypes = new[]
            {
                BaseItemKind.CollectionFolder
            }
        }).Items;
        
        BaseItem? collectionFolder = collectionFolders.FirstOrDefault(x => x.Name == folder.Name);

        bool hasEpisodes = libraryManager.GetItemsResult(new InternalItemsQuery()
        {
            IncludeItemTypes = new[]
            {
                BaseItemKind.Episode
            },
            Limit = 1,
            ParentId = collectionFolder?.Id ?? Guid.Empty,
            Recursive = true
        }).Items.Any();
        bool hasMovies = libraryManager.GetItemsResult(new InternalItemsQuery()
        {
            IncludeItemTypes = new[]
            {
                BaseItemKind.Movie
            },
            Limit = 1,
            ParentId = collectionFolder?.Id ?? Guid.Empty,
            Recursive = true
        }).Items.Any();
        
        return hasEpisodes && hasMovies;
    }

    public static VirtualFolderInfo[] FilterToUserPermitted(this IEnumerable<VirtualFolderInfo> folders, ILibraryManager libraryManager, User? user)
    {
        IReadOnlyList<BaseItem> collectionFolders = libraryManager.GetItemsResult(new InternalItemsQuery()
        {
            IncludeItemTypes = new[]
            {
                BaseItemKind.CollectionFolder
            }
        }).Items;
        
        IEnumerable<VirtualFolderInfo> filtered = folders
            .Select(x =>
            {
                BaseItem? collectionFolder = collectionFolders.FirstOrDefault(y => y.Name == x.Name);

                return new VirtualFolderInfo()
                {
                    Name = x.Name,
                    CollectionType = x.CollectionType,
                    LibraryOptions = x.LibraryOptions,
                    Locations = x.Locations,
                    PrimaryImageItemId = x.PrimaryImageItemId,
                    RefreshProgress = x.RefreshProgress,
                    RefreshStatus = x.RefreshStatus,
                    ItemId = x.ItemId ?? collectionFolder?.Id.ToString() ?? Guid.Empty.ToString()
                };
            });

        if (user != null)
        {
            Guid[] latestItemExcludes = user.GetPreferenceValues<Guid>(PreferenceKind.LatestItemExcludes);
            filtered = filtered.Where(x => !latestItemExcludes.Contains(Guid.Parse(x.ItemId)));
        }

        return filtered
            .Where(x => libraryManager.GetItemById<BaseItem>(Guid.Parse(x.ItemId), user) != null)
            .ToArray();
    }

    /// <summary>
    /// Filters folders down to only those selected in the global library scope
    /// (plugin configuration "FilteredLibraries"). When no libraries are selected
    /// the scope is inactive and every folder is kept.
    /// </summary>
    public static IEnumerable<VirtualFolderInfo> FilterToGlobalScope(this IEnumerable<VirtualFolderInfo> folders)
    {
        string[]? scope = HomeScreenSectionsPlugin.Instance?.Configuration?.FilteredLibraries;
        if (scope == null || scope.Length == 0)
        {
            return folders;
        }

        HashSet<Guid> allowed = new HashSet<Guid>();
        foreach (string id in scope)
        {
            if (Guid.TryParse(id, out Guid parsed))
            {
                allowed.Add(parsed);
            }
        }

        return folders.Where(x => Guid.TryParse(x.ItemId, out Guid id) && allowed.Contains(id));
    }

}
