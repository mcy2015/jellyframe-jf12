# JellyFrame × File Transformation → Jellyfin 12.4 适配构建

构建日期：2026-11-02 · 构建机：macOS / dotnet 10.0.403 · 目标：NAS `jellyfin/jellyfin` 12.4.0（`/share/Container/jellyfin/config`）

## dist/ 产物（5 件）

| 文件 | 内容 | 用途 |
|---|---|---|
| `FileTransformation_3.0.0_jf124.zip` | FT 3.0.0 重编（`JellyfinVersion=12.4.0`/net10.0），4 文件（dll+deps.json+pdb+logo.png，镜像官方 zip 布局） | **首选注入层（manifest 指向）** |
| `JellyFrame_1.5.3.1_jf124.zip` | JellyFrame 重编（net10.0 + Controller/Model 12.4.0 + Sqlite 10.0.12，AssemblyVersion 1.5.3.1），3 dll 镜像官方布局 | **首选框架层（manifest 指向）** |
| `manifest.json` | 自托管插件仓库清单（jsDelivr sourceUrl，targetAbi 全钉 12.4.0.0，md5 校验齐全） | 供仓库 URL 添加 |
| `Jellyfin.Plugin.MediaBarEnhanced_v3.12.0.1_jf124.zip` | MBE 3.12.0.1 重编（net10.0，0 错 0 警），依赖 FT | 首页大横幅（按库勾选/排除流派标签/预告片），已被 3.12.0.2 取代 |
| `Jellyfin.Plugin.MediaBarEnhanced_v3.12.0.2_jf124.zip` | MBE 3.12.0.2（+配置页汉化） | 同上，当前版 |
| `HomeScreenSections_3.0.0.1_jf124.zip` | Home Screen Sections 3.0.0.1（net10.0 + **zh.json 224 键词典** + 管理页静态汉化） | 动态主屏板块，依赖 FT |
| `CollectionSections_3.0.0.1_jf124.zip` | Collection Sections 3.0.0.1（配置页汉化） | 合集/播放列表板块，依赖 Home Screen Sections |
| `CustomTabs_0.3.0.1_jf124.zip` | Custom Tabs 0.3.0.1（配置页汉化） | 自定义标签页，依赖 FT |
| `PluginPages_3.0.0.1_jf124.zip` | Plugin Pages 3.0.0.1 | 插件自定义页面，依赖 FT |
| `EditorsChoice_1.6.2.1_jf124.zip` | EditorsChoice 1.6.2.1（配置页汉化） | Netflix 式精选滑块，依赖 FT |
| `JellyfinEnhanced_12.14.0.2_jf124.zip` | Jellyfin Enhanced 12.14.0.2（jf12 重编 + 管理配置页汉化约 1000 处；用户面板随机按钮新增「媒体库范围」多选） | Web UI 增强套件，依赖 FT。⚠️ 装了本仓版本就不要再加 JE 官方源升级，否则英文版会覆盖汉化 |
| `JellyfinEnhanced_12.14.0.1_jf124.zip` | JE 12.14.0.1（旧版，无媒体库范围功能；manifest 历史条目仍指向它） | 回退件 |

### Jellyfin Enhanced 官方源（本项目已自带汉化版，仅供对照）
官方仓库原生支持 Jellyfin 12.x：`https://raw.githubusercontent.com/n00bcodr/jellyfin-plugins/main/manifest.json`。上游周更（12.13→12.14 仅 6 天），官方新版本号 > 12.14.0.1 时若同时加了官方源会被提示升级并覆盖汉化。
| `FileTransformation_3.0.0_official-jf120.zip` | 官方 Release-12.0.0 原包 | 手动回退件 |
| `JellyFrame_1.5.3_official.zip` | 官方 1.5.3 原包，md5 `887fa7d8c017e8ab60e6db68193de750` 与官方 manifest 一致 | 手动回退件 |

## 源码改动（本仓库，相对上游 main）

### FileTransformation（2 行，纯版本对齐）
- `csproj`: `<JellyfinVersion>12.0.0</JellyfinVersion>` → `12.4.0`（联动 net10.0 + 4 个 Jellyfin NuGet 包）
- `Properties/AssemblyInfo.cs`: `[assembly: JellyfinVersion("12.0.0")]` → `"12.4.0"`（该特性运行时无消费方，纯自描述）

### JellyFrame（csproj 3 处 + JellyfinSurface.cs 3 处 API 断裂修复）
- `csproj`: `net9.0→net10.0`、`Controller/Model 10.11.0→12.4.0`、`Microsoft.Data.Sqlite 9.0.0→10.0.12`
  - Sqlite 选 10.0.12 而非最新 10.0.14：必须 ≤ 宿主自带版本，低版本会向上滚动（官方 1.5.3 引 9.0.0 在 12.1 跑通 = 同机制实证）
- `Runtime/JellyfinSurface.cs`：
  1. `AddToPlaylist`: `AddItemToPlaylistAsync(pid, ids, uid)` → `(pid, ids, null, uid)`（12.4 新增 `int? newPosition` 参数）
  2. `ResetUserPassword`: `ResetPassword(user)` → `ResetPassword(uid)`（12.4 签名 `Guid`）
  3. `GetUsers`: `_users.Users` → `_users.GetUsers()`（12.4 移除 `Users` 属性）

## NAS 部署·方式一（推荐）：仓库 URL 安装，原版流程

已发布自托管插件仓库：**https://github.com/mcy2015/jellyframe-jf12**（公开仓，manifest + dist 全在仓内；jsDelivr/raw 双通道 + 回下 md5 全部验证通过）。

1. Dashboard → 插件 → 存储库 → 添加（**NAS 实测 raw 可达，此为常态 URL**，永远最新无 CDN 缓存）：
   ```
   https://raw.githubusercontent.com/mcy2015/jellyframe-jf12/main/manifest.json
   ```
   （raw 不可达时的备选：jsDelivr `https://cdn.jsdelivr.net/gh/mcy2015/jellyframe-jf12@<最新短sha>/manifest.json`——注意 @main 在 push 后有分钟至小时级的旧代际缓存窗口，不推荐作常态）
2. 目录 → 先装 **File Transformation**（3.0.0.0）→ 按提示重启
3. 再装 **Jellyframe**（**1.5.3.1**，为 12.4 编译件）→ 重启
4. 走下面验证清单

manifest 的 targetAbi 全部钉 12.4.0.0：12.0–12.3 服务器在目录看不到（防止装上解析不了的高版本引用）；后续官方仓库发新版本时同 GUID 走正常升级路径。

## NAS 部署·方式二（手动，备用）

```bash
# 0. 若装过旧版：跨大版本官方指引是先卸载（Jellyfin 停机状态下操作）
sudo docker stop jellyfin
sudo rm -rf /share/Container/jellyfin/config/plugins/FileTransformation
sudo rm -rf /share/Container/jellyfin/config/plugins/JellyFrame

# 1. 放入本 dist/ 的 zip 解压产物
sudo mkdir -p /share/Container/jellyfin/config/plugins/FileTransformation /share/Container/jellyfin/config/plugins/JellyFrame
#    FileTransformation_3.0.0_jf124.zip 内容 → plugins/FileTransformation/
#    JellyFrame_1.5.3.1_jf124.zip   内容 → plugins/JellyFrame/

# 2. 重启
sudo docker start jellyfin
```

无 meta.json 时 Jellyfin 自动生成（targetAbi=服务器版本、AutoUpdate=false）→ **不受目录安装 targetAbi 门禁，也不会被自动更新覆盖**（MetaTube 先例实锤）。

## 验证清单（按序）

1. **日志加载**（`docker logs jellyfin` 或 log/ 目录 latest.log）：
   ```
   grep -iE "filetrans|jellyframe|malfunction|notsupported" log_*.txt | tail -30
   ```
   期望：`Loaded plugin: File Transformation 3.0.0.0` + `Loaded plugin: Jellyframe 1.5.3.1`，无 NotSupported/Malfunctioned。
   JellyFrame 侧期望看到 `[JellyFrame] Probing for File Transformation plugin injection...` 且无 "not found"。
2. **注入链路**：Dashboard 左侧出现 **Mods** / **Themes** 两个菜单 = JellyFrame 配置页活着。
3. **主题生效**：Themes → Marketplace → 默认官方源（themes.v2.json）→ Apply 任一主题（如 Ultrachromic）→ **Ctrl+Shift+R 强刷**。
4. 若主题加载但无背景图：检查 显示设置 里背景图/Backdrop 开关（FT issue #20 的假故障先例）。

## 回退到官方包（仅当 1.5.3.1 加载失败）

```bash
sudo docker stop jellyfin
sudo rm -rf /share/Container/jellyfin/config/plugins/JellyFrame/*
# JellyFrame_1.5.3_official.zip 内容 → plugins/JellyFrame/
sudo docker start jellyfin
```
FT 不用动（对接是反射式的，与 JellyFrame 版本无关）。若手动回退件也不行，反向再试 `FileTransformation_3.0.0_official-jf120.zip`。

## 回滚

```bash
sudo docker stop jellyfin
sudo rm -rf /share/Container/jellyfin/config/plugins/{FileTransformation,JellyFrame}
sudo docker start jellyfin
# 配置残留在 config/plugins/configurations/，可顺手删对应 xml
```

## 已知风险（如实）

- 目录安装件（1.5.3.1，为 12.4 编译）的运行时面同样未经真机验证（编译期 3 处 API 已修，但 15+ Controller 服务面的运行时行为要真机冒烟）；官方 net9.0 包（12.1 实锤）作为手动回退件保留在 dist/。
- 运行时 API 断裂只修了**编译期暴露的 3 处**；Plugin.cs 注入的 15+ Controller 服务面在 12.4 的运行时行为（事件面、Dto、LiveTv 等）编译器不保证，真机冒烟时盯 `[JellyFrame]` 日志。
- FT 仓库 10 月有 open 边缘 bug：#90 页面缓存致注入静默失败（强刷可破）、#93/#94 HEAD/Range 请求拿不到转换后内容（影响个别客户端缓存行为）。
- 主题 CSS 视觉适配（选择器 vs 12.4 DOM）是另一层：本包只保证「装得上、注入得出」，长得对不对要看真机。

## 重新构建

```bash
cd FileTransformation/src/Jellyfin.Plugin.FileTransformation && dotnet build -c Release
cd ../../JellyFrame && dotnet build -c Release
# JellyFrame 输出目录含宿主程序集（CopyLocalLockFileAssemblies=true），部署只取
# Jellyfin.Plugin.JellyFrame.dll + Jint.dll + Acornima.dll 三个文件（镜像官方 zip）
# 重打包后：更新 manifest.json 的 version/checksum/sourceUrl → push GitHub（jsDelivr 有缓存，
# 急时可打 https://purge.jsdelivr.net/gh/mcy2015/jellyframe-jf12@main/manifest.json 或 sourceUrl 钉 @<sha>）
```
