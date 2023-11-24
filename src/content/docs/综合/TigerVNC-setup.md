---
title: TigerVNC 配置指南
---

## 需求

大多数情况下，算法的调试工作可以通过工控机引出视频线在外接显示屏上完成。但如果面对车辆跑动时，对车辆实时状态监测的需求则无法满足。此时更好的方法便是使用车载路由器借助 VNC 协议进行远程桌面共享。

## 环境配置

### 安装 TigerVNC 相关软件包

```bash
sudo apt install tigervnc-common tigervnc-standalone-server tigervnc-scraping-server
```

### 设置 vnc 用户及密码

vnc 有一套依赖且独立于 Linux 用户的用户表。

在终端执行： `vncpasswd`，根据提示输入两次密码（要求大于六个字符） 

### 正确设置 TigerVNC 配置

编辑 `~/.vnc/` 下的 `xvncstart`