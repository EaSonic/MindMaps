# Home Surveillance Demo

一个纯静态的家庭巡视 Demo，参考 `/Users/eason/Documents/CChromium/_videoSurveillance/basic` 的 CTRTC 接入方式整理而成。

## 文件结构

- `index.html`
- `styles.css`
- `app.js`
- `vendor/ctrtc-web-sdk-dev.js`

整个 `home-surveillance-demo/` 目录可以整体拷贝，满足“打包在一个文件夹下面”的要求。

## 使用方式

1. 守家设备打开 `index.html`，选择“守家端”，填写房间信息后点击 `Join`
2. 页面会按固定算法自动生成 `token` 和 `tokenParam`，并把请求域设置为 `meeting-rtc.ctcdn.cn`
3. 加入成功后会自动打开摄像头并发布视频，不会创建或发布麦克风轨道
4. 外出巡视设备打开同一个目录里的 `index.html`，选择“巡视端”加入同一房间
5. 远端视频会自动订阅并显示在页面上

## 注意

- 这个 Demo 不依赖打包器，可以直接分发
- 但浏览器摄像头和 WebRTC 在很多环境里要求安全上下文
- 如果 `iOS Files` 直接打开的 `file://` 页面拿不到摄像头权限，需要把同一目录放到 HTTPS 静态服务下再访问
