---
title: 在 Linux 上设置代理
---

## 背景

由于防火长城 [GFW](https://zh.wikipedia.org/wiki/%E9%98%B2%E7%81%AB%E9%95%BF%E5%9F%8E)（打开代理后再访问）于 2002 年启动 TCP 重置攻击与大规模的 DNS 污染，致使大量国外学术研究与其他网站无法访问，如 Github, Google Scholar, Wikipedia等。

## 安装代理应用

> 虽然叫做 Clash for Windows 但实际上是全平台软件

浏览器访问以下链接下载安装包:

- 适用于 x86_64 架构  
    `https://ghproxy.com/github.com/Fndroid/clash_for_windows_pkg/releases/download/0.20.8/Clash.for.Windows-0.20.8-x64-linux.tar.gz`

- 适用于 arm64 架构  
    `https://ghproxy.com/github.com/Fndroid/clash_for_windows_pkg/releases/download/0.20.8/Clash.for.Windows-0.20.8-arm64-linux.tar.gz`

## 启动 Clash for Windows 代理程序

先把下载回来的压缩包[解压](https://www.myfreax.com/tar-extract-tar-gz-file/)，然后在终端中输入：

```bash
  chmod 0755 {解压后路径}/cfw
  # 赋予 cfw 二进制文件可执行权限

  cd {解压后路径}/
    
  ./cfw
  # 启动 cfw
```

![start](/assets/images/setting-up-proxy-on-linux/start.png)

## 设置 Clash for Windows

- 启动后其窗口自动出现。  

- 点击 `Profiles` 选项卡，在输入框中输入从 [QQ@NekoRectifier](https://wpa.qq.com/msgrd?v=3&uin=2182998627&site=qqq&menu=yes) 获取到的链接并点击 `Download` 开始下载配置文件。
![profile](/assets/images/setting-up-proxy-on-linux/download_profile.png)

- 下载完成后，点击一下刚刚添加的配置文件以选中。然后切换到 `Proxies` 选项卡，点击一个有有效延迟的节点即可。
![select_node](/assets/images/setting-up-proxy-on-linux/select_node.png)

- 打开你当前系统的设置，找到网络-代理设置选项。  
并按照下图进行设置。

    ![network_setting](/assets/images/setting-up-proxy-on-linux/network_setting.png)

- [EXTRA] 你可以勾选上 `General` 选项卡中的 `Start with Linux` 选项，实现自启动。

{: .important}
> 这样的话，大部分的应用都会按照系统的设置走代理进行网络连接了，但是终端内的应用依然是无效的还需要进行其他设置。

## 配置终端

### 全局终端代理（不推荐）

{: .warning}
> 全局代理可能导致某些使用国内源的应用连接缓慢

编辑 .bashrc 文件（如使用其他 shell 请对应到各自的配置文件）  
终端输入：`nano ~/.bashrc`

在文件的最后一行添加：

```bash
  export https_proxy=http://127.0.0.1:7890;
  export http_proxy=http://127.0.0.1:7890;
  export all_proxy=socks5://127.0.0.1:7890;
```

之后重新启动终端或者执行 `source ~/.bashrc` 即可完成。

### Proxychains-ng

1. 安装

    - arch 系： `sudo pacman -S proxychains`

    - debian 系： `sudo apt install proxychains`

2. 配置

    编辑 `/etc/proxychains.conf` 文件（要求 su 权限）  
    用 ‘#’ 注释掉 `proxy_dns`，并在文件末尾添加上你的代理信息。

    以下是配置文件示例。

    ```text
    # proxychains.conf  VER 4.x
    #
    #        HTTP, SOCKS4a, SOCKS5 tunneling proxifier with DNS.
    # ...

    #dynamic_chain

    strict_chain

    # Quiet mode (no output from library)
    #quiet_mode

    #proxy_dns

    tcp_read_time_out 15000
    tcp_connect_time_out 8000

    port 443

    [ProxyList]

    socks5 127.0.0.1 1080

    ```

    其上各种配置都按照自己的实际情况填写，如 CFW 一般使用 7890 作为SOCKS端口，则填 `socks5 127.0.0.1 7890`。

3. 使用

    对于有代理需求的应用，直接在前面加上 `proxychains` 再执行即可。
    ![proxy-use](/assets/images/setting-up-proxy-on-linux/show.png)

4. 常见问题

    - 127.0.0.1:xxxx 这个地址出现在运行时出现多次且无法连接到网络  
        A： 检查终端环境变量设置。查看是否有手动设置其他代理，将环境变量中的 `all_proxy` 和 `ALL_PROXY` 删除即可。
