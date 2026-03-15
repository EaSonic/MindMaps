# Home Surveillance Demo

## What This Is

一个面向个人家庭巡视场景的轻量 Web 监控 Demo，基于 CTRTC 的 `basic` demo 思路改造成更贴近实际使用的双端页面。它允许守家端在加入房间后自动开启摄像头并发布视频，同时让外出中的 PC 或手机巡视端自动订阅并观看远端画面。

## Core Value

外出时能用一套足够轻、足够快、跨 PC 和手机都顺手的页面，立刻看到家里的实时画面。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 提供一个无需打包器的静态前端 Demo，可直接整体拷贝分发
- [ ] 守家端 `client.join` 成功后自动打开摄像头，并保持麦克风关闭
- [ ] 巡视端加入后自动订阅并展示远端视频流
- [ ] 页面在桌面和移动端都具备舒适观看与操作体验
- [ ] 所有运行所需文件收敛在一个目录下，方便放入 iOS Files 或静态托管目录

### Out of Scope

- 用户鉴权系统或 token 服务端生成逻辑 — 当前目标是 CTRTC 前端接入 demo，不扩展后台
- 历史录像、回放、云端存储 — 非当前“实时巡视”核心路径
- 多房间管理、家庭成员权限体系 — 会显著放大产品面和实现成本

## Context

参考实现位于 `/Users/eason/Documents/CChromium/_videoSurveillance/basic`。原始 demo 偏 SDK 能力验证，包含较多调试按钮和 publish/unpublish 手动操作；本项目需要压缩成家庭监控场景的低操作负担版本，强调自动开视频、默认静音、自动订阅、单目录分发，以及在手机端的可读可点。

## Constraints

- **Tech stack**: 使用纯静态 HTML/CSS/JS 和本地 CTRTC SDK 文件 — 满足单文件夹分发与离线拷贝需求
- **Compatibility**: 需要兼顾 PC 和移动端浏览器布局 — 因为巡视端会在出差途中通过手机查看
- **Distribution**: 最终产物必须收敛在一个目录下 — 便于直接放入 iOS Files 或上传到静态目录
- **Media**: 守家端默认只发布视频轨道，不创建麦克风轨道 — 贴合“巡视”而非“通话”场景

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 采用单页静态应用而不是 React/Vite | 当前目标是最快拿到可拷贝、可直接打开的 demo | ✓ Good |
| 拆分“守家端/巡视端”模式 | 实际巡视场景中，观看端通常不应自动打开本地摄像头 | ✓ Good |
| SDK 文件本地随包分发 | 避免运行时依赖外部资源，符合单目录交付目标 | ✓ Good |

---
*Last updated: 2026-03-15 after initial project initialization*
