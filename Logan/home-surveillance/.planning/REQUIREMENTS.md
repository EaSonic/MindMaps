# Requirements: Home Surveillance Demo

**Defined:** 2026-03-15
**Core Value:** 外出时能用一套足够轻、足够快、跨 PC 和手机都顺手的页面，立刻看到家里的实时画面。

## v1 Requirements

### Room Access

- [ ] **ROOM-01**: 用户可以填写房间名、用户 ID、token 和 token 参数并加入房间
- [ ] **ROOM-02**: 页面会持久化最近一次输入，方便下次再次加入

### Camera Publish

- [ ] **CAM-01**: 守家端在 `client.join` 成功后自动创建摄像头视频轨道
- [ ] **CAM-02**: 守家端只发布视频轨道，不创建或发布麦克风轨道
- [ ] **CAM-03**: 守家端能够显示本地预览，确认当前摄像头画面

### Remote Patrol

- [ ] **PATROL-01**: 巡视端加入后不会自动打开本地摄像头
- [ ] **PATROL-02**: 页面在收到远端视频发布事件后自动订阅并播放视频
- [ ] **PATROL-03**: 当远端用户离开或取消发布时，页面会移除对应画面卡片

### Responsive Experience

- [ ] **RESP-01**: 页面在桌面端具有双栏控制区和视频区布局
- [ ] **RESP-02**: 页面在移动端能自动堆叠为单栏并保持操作舒适
- [ ] **RESP-03**: 日志、状态和视频区域在不同屏幕下都保持可读

### Packaging

- [ ] **PACK-01**: 运行所需静态资源都位于同一项目目录中
- [ ] **PACK-02**: 项目不依赖构建工具即可直接打开和分发

## v2 Requirements

### Operational Hardening

- **OPS-01**: 支持多个守家端摄像头同时接入同一房间
- **OPS-02**: 支持网络重连后的自动恢复策略
- **OPS-03**: 支持更明显的离线/断流告警

## Out of Scope

| Feature | Reason |
|---------|--------|
| 服务端签发 token | 当前聚焦前端 demo，不延伸后台系统 |
| 云录像与历史回放 | 不属于首版实时巡视核心价值 |
| 多租户账号体系 | 复杂度过高，当前只有个人/家庭场景 |
| 原生 iOS App 封装 | 当前要求是单目录 Web demo |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ROOM-01 | Phase 1 | Pending |
| ROOM-02 | Phase 1 | Pending |
| CAM-01 | Phase 2 | Pending |
| CAM-02 | Phase 2 | Pending |
| CAM-03 | Phase 2 | Pending |
| PATROL-01 | Phase 3 | Pending |
| PATROL-02 | Phase 3 | Pending |
| PATROL-03 | Phase 3 | Pending |
| RESP-01 | Phase 4 | Pending |
| RESP-02 | Phase 4 | Pending |
| RESP-03 | Phase 4 | Pending |
| PACK-01 | Phase 5 | Pending |
| PACK-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after initial definition*
