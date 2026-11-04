# 薪情不错 · 上班鼓励器

同一个工资计算模块，提供网页版、微信小程序、Windows 与 macOS 桌面项目。当前版本 0.2.0。

## 功能

- 月薪、周薪、日薪、时薪；逐秒收入、日进度、分钟与小时收入。
- 本周 / 本月累计，按实际排班天数分摊；周一为每周起点。
- 工作日选择、可点击的调休日历、跨午夜班次、不计薪休息。
- 下班倒计时、发薪日倒计时、收入小目标与里程碑。
- 金额隐藏、极简模式、无工资金额的分享文案。
- 工资、排班和目标的 JSON 备份导入导出，四端格式一致。
- 桌面专属：可拖动 / 调整大小 / 取消置顶的悬浮窗、系统托盘 / Mac 菜单栏入口、单实例、可选下班通知。

所有工资数据留在本机。无需账户、服务器或模型 API。各端不自动同步，通过备份迁移。特殊节假日需自行在日历中调整。

## 项目结构

```
shared/core.cjs             平台无关计算、校验、日历与备份模块（唯一源文件）
dist/                      网页与桌面共用的静态界面
miniprogram/               可直接导入微信开发者工具的原生小程序项目
src-tauri/                 Windows / Mac 的 Tauri 2 桌面外壳
scripts/build.mjs          把唯一计算模块同步到各端
scripts/check.mjs          页面、事件、语法、图标与同步检查
tests/                     计算、网页交互、小程序生命周期测试
.github/workflows/         GitHub Actions 验证和桌面打包
```

`dist/` 是直接维护的界面目录，不是需要删除后重新生成的临时目录。修改工资算法请编辑 `shared/core.cjs`，然后运行 `npm run build`，不要分别修改生成的 `dist/core.js`、`dist/calc.mjs`、`miniprogram/utils/core.js`。

## 微信小程序

1. 安装微信开发者工具，用有开发权限的微信扫码登录。
2. 导入解压后 **`miniprogram` 目录**，不是整个源码根目录。
3. 项目已配置 AppID `wx7f4c9d015e66bf92`。若提示无权限，需要管理员把当前微信添加为开发者。
4. 不需要构建 npm，也不需要配置服务器域名。直接编译，预览并在真机测试。
5. 上传体验版，测试后通过小程序后台完成所需账号信息、类目、备案与提审事项，再发布。

小程序切到后台会清理计时器；重新打开直接按当前时间补算，不依赖后台常驻。不会发送未经订阅的后台通知。备份导入可先把 JSON 文件发给文件传输助手，再通过聊天文件选择；低版本微信没有文件分享 API 时，导出会在确认后复制备份文本。

`miniprogram/icon.png` 可用作账号头像的候选图。最终上线是否通过取决于微信平台审核。

## Windows 本机开发与打包

准备 Node.js 22+、Rust stable、Visual Studio Build Tools（“使用 C++ 的桌面开发”工作负载）、WebView2。详见 Tauri 官方先决条件。

```bash
npm ci
npm run verify
npm run desktop:dev
npm run desktop:build -- --bundles nsis
```

安装包位于 `src-tauri/target/release/bundle/nsis/`。当前没有付费代码签名，系统可能提示未知发布者；这不代表已做过杀毒认证。首次安装缺少 WebView2 时，安装程序可能需要联网下载运行时。应用安装后无需联网计算工资。

## Mac 本机开发与打包

准备 Node.js 22+、Rust stable、Xcode Command Line Tools。只开发和测试不需要购买苹果开发者会员。

```bash
npm ci
npm run verify
npm run desktop:dev
npm run desktop:build -- --bundles app,dmg
```

默认生成当前 Mac 架构的应用。若需同时支持 Intel 与 Apple Silicon：

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
npm run desktop:build -- --target universal-apple-darwin --bundles app,dmg
```

Universal 安装包位于 `src-tauri/target/universal-apple-darwin/release/bundle/dmg/`。

已配置临时签名 `signingIdentity: "-"`，不需要付费证书，但它不是 Developer ID 签名，也没有苹果公证。可信测试版本首次启动可能需要在“系统设置 → 隐私与安全性”手动允许。不要关闭整个系统的安全检查。

正式签名和公证时再替换签名配置并在构建环境注入自己的证书；不要把证书、密码或密钥放进仓库。

## 在 GitHub 自动生成 Windows / Mac 安装包

无需自己同时拥有两台电脑：

1. 在 GitHub 创建自己的仓库，把**源码根目录全部内容**提交，确保包含隐藏的 `.github/workflows` 目录。可使用 GitHub Desktop 的 Add local repository / Publish repository。
2. 仓库 Actions → **Build Windows and Mac apps** → **Run workflow**。
3. 全部构建成功后，在该次运行底部 Artifacts 下载：
   - `salary-cheer-windows-x64`：Windows 安装程序。
   - `salary-cheer-mac-universal`：Intel / Apple Silicon 通用 DMG。
   - `salary-cheer-wechat-project`：小程序项目文件。
4. 若推送形如 `v0.2.0` 的标签，流程会附加安装包到一个 **草稿 Release**；检查后再手动发布供大家下载。普通手动运行不会创建公开 Release。

首次运行可能需要在仓库启用 Actions。私有仓库的构建时长受账号额度影响；本项目不主动购买付费资源。工作流尚未在你的 GitHub 账户执行，实际构建结果以运行日志为准。

## 桌面使用

- 主面板的“悬浮窗”按钮，或托盘菜单，可打开独立收入窗口。
- 拖动悬浮窗标题区域移动，边缘可调整大小；准星按钮切换置顶。
- 主面板和悬浮窗共享本机工资与金额隐藏状态。
- 关闭窗口会收进托盘，托盘菜单“退出”才完全退出；无托盘支持时保留普通关闭行为。
- 下班通知默认关闭，在设置中开启。应用必须仍在运行，且系统允许通知；睡眠 / 完全退出时不保证提醒。
- 系统托盘 / 菜单栏不显示实际工资，避免旁人看到。

## 计算规则

月薪按当月实际排班天数均分，周薪按该周实际排班天数均分，日薪按当日计薪秒数均分，时薪按实际计薪小时数换算。不采用固定 21.75 天口径。不计薪休息从总时长和已过时长同时扣除。

跨午夜班次归属于开始日期。跨月周统计对每天应用其所属月份 / 周的工资基数，不用单日金额简单乘整周。手动休假优先于额外上班。

每日收入上班前为零、下班后封顶。周 / 月累计是按当前设置回算的估算，不是不可变的历史工资流水。修改工资或排班会重算过去累计，不包括税、奖金和加班费，也不做考勤。发薪日只是固定日历日提醒，短月取月末，不自动顺延节假日。

## 验证范围

- Node 自动化覆盖工资换算、月/周跨界、休假、午休、午夜、无工作日、备份校验、日历操作、网页表单与隐私、小程序前后台计时器。
- 网页视觉检查依赖浏览器；小程序需微信开发者工具和真机验证。
- 原生系统目标的编译检查不等于安装包已生成，也不等于在 Windows / Mac 上完成安装实测。

## 发布前最短实测清单

1. 三种真实工资与作息场景，确认日、周、月分摊。
2. 主面板与悬浮窗修改工资和隐藏金额后，彼此同步。
3. 托盘恢复、完全退出、重复启动、悬浮窗移动/缩放/置顶。
4. Mac Intel 与 Apple Silicon 各至少一台机器启动测试。
5. 小程序切到后台、跨日再打开；修改排班并返回首页；分享不带工资。
6. 四端备份互相导入；拒绝错误 JSON；确认备份文件自己保管。
