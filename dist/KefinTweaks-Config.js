// KefinTweaks-Config (KefinTweaks jf12 fork): hand-written JavaScript Injector entry; keep it ABOVE KefinTweaks-injector.
// kefinTweaksRoot is the one place that says where the KefinTweaks files come from and which version (see docs/JF12-FORK.md).
// Saving from the KefinTweaks configuration screen rewrites this entry (and only this one).

window.KefinTweaksConfig = {
  "kefinTweaksRoot": "/web/kefin/0.5.0-jf12.1/",
  "enabled": true,
  "scripts": {
    "watchlist": true,
    "homeScreen": false,
    "search": false,
    "headerTabs": false,
    "customMenuLinks": false,
    "hamburgerMenu": false,
    "games": false,
    "breadcrumbs": true,
    "playlist": true,
    "itemDetailsCollections": false,
    "flattenSingleSeasonShows": true,
    "seriesInfo": true,
    "versionPreferences": true,
    "collections": true,
    "exclusiveElsewhere": false,
    "backdropLeakFix": false,
    "dashboardButtonFix": false,
    "infiniteScroll": true,
    "removeContinue": false,
    "subtitleSearch": true,
    "skinManager": false,
    "thumbnailScrubber": false,
    "watchTogether": false,
    "userManager": false
  },
  "customTabs": false,
  "imdbTop250Url": "",
  "watchlist": {
    "sideMenu": true,
    "topNavigation": "main",
    "userMenu": true,
    "order": 2,
    "autoRemovePlayed": false,
    "statistics": false,
    "mediaBarButton": false
  },
  "search": {
    "enableJellyseerr": false
  },
  "flattenSingleSeasonShows": {
    "hideSingleSeasonContainer": false
  },
  "seriesInfo": {
    "use24HourTimeFormat": false
  },
  "versionPreferences": {
    "versions": [
      "4k",
      "2160p",
      "1080p",
      "720p",
      "576p",
      "480p",
      "360p",
      "__none__"
    ],
    "editions": [
      "Theatrical",
      "Director's Cut",
      "Extended Edition",
      "Fan Edit",
      "__none__"
    ],
    "showVersionBeforeEdition": false
  },
  "thumbnailScrubber": {
    "PreviewOnHover": false,
    "UseVideoStream": true,
    "FallbackAfterMs": 500,
    "HOVER_PREVIEW_TIMEOUT_MS": 800,
    "HOVER_TIMEOUT": 800,
    "HOVER_PREVIEW_FRAME_MS": 250,
    "SCRUB_ACTIVATION_DELAY_MS": 300
  },
  "watchTogether": {
    "sessionTimeout": 30
  },
  "userManager": {
    "defaultTemplateName": "",
    "templates": []
  },
  "exclusiveElsewhere": {
    "hideServerName": false
  },
  "skins": [],
  "defaultSkin": null,
  "themes": [],
  "customMenuLinks": [],
  "optionalIncludes": []
};
