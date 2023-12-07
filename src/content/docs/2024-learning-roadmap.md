---
title: 2024 无人系统部介绍
---

嗨，你好啊。欢迎加入 HUAT FSAC 无人系统部👏，在这里开始你的第一步学习吧。 

> 请注意：本教程指南仍在编写阶段，内容随时可能更新。

## 序

首先介绍一下无人系统部所用的软件与开发平台。我们的软件开发主要基于 Robot Operating System（ROS），你可以把它理解为有着各种工具的工具箱。我们依托于这个“平台”来开发各种各样的功能包，比如视觉的图像处理，对路径的计算与规划等。  
由于 ROS 一般运行在 Linux 操作系统上，所以掌握部分 Linux 知识是必须的。在日常代码的编写上我们会使用 Visual Studio Code，当然你也可以使用你熟悉的编辑器/集成开发环境。而在开发语言上 ROS 限定了两种：C++ 与 Python，你也可以按照喜好自由选择。

而在你的学习过程中，我们希望你能自己搜索/了解没听说过的软件和领域，遇到问题时能自己先搜索下报错信息，看到教程指南时也能自己分析是否与所搜寻的相符。最重要的是——对未知的领域保持探索欲与求知欲。

当然我们也非常乐意回答你在学习时提出的问题，只要它们是在你真的努力尝试搜寻答案却仍然无果之后——我们不希望提问被滥用为快速解决问题的“捷径”。

最后，培训不仅仅是完成任务，我们更乐意看到你在不断尝试的过程中学到真东西，而非只是按部就班草草完成了事。

—— NekoRectifier

## 如果你不怎么习惯用电脑

<!-- - 在你想开口问什么之前，我都建议先上搜索引擎搜搜看，说不定它比 -->

- 在搜索什么东西的时候，我更推荐使用[必应](www.bing.com)而非[百度](www.baidu.com)。原因不过后者的竞价排名只会让你更难搜索到你需要的信息。

- 搜索的时候别忘了看一下页面的日期，有时候过时的信息反而会误导你。

<!-- :::caution
## 0. 请学会正确的提问

请务必在自行思考，网上寻找仍无法解决之后简明清楚的说明你所遇到的问题。具体请参考[提问的智慧](https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md)
::: -->

## 1. 基础环境配置

我们先从接触全新的系统环境开始，既然 ROS 运行在 Linux 之上。我们就得先安装一个 Linux 操作系统。  
目前与 ROS 兼容性最好的便是 Ubuntu 操作系统，你可以自行搜索安装方式。但如果你没什么主意💡，下面是一个现成的安装方案可以参考。

### 1.1 Linux（Ubuntu）系统在 VMWare 虚拟机上的安装

![ubuntu-logo](./../../assets/images/2024-learning-roadmap/ubuntu-logo.webp)

通过 VMWare Workstation 来部署 Ubuntu 虚拟机，你可以搜索[vmware ubuntu 18.04 安装](https://www.bing.com/search?q=vmware+ubuntu+18.04+%E5%AE%89%E8%A3%85)。

以下是几点提示：

- 你可以在[这里](https://www.vmware.com/go/getworkstation-win)下载 VMWare 虚拟机最新版本并进行安装
- Ubuntu 系统要求/建议安装为 Ubuntu LTS 18.04，因为这个版本与我们使用的 ROS 版本搭配
- VMWare Workstation 的版本并没有严格要求，16/17/18 都是可以的



<!-- #### WSL2

:::warning
此前有过 WSL 上软件图形界面画面撕裂（rqt）的报告，如果你只想尽快配置好，那么请选择 VMware。
:::

![wsl](./../../assets/images/2024-learning-roadmap/wsl.png)


Windows Subsystem for Linux (WSL) 是微软在 Windows 10 中引入的一个新功能,它允许在 Windows 系统上原生运行Linux二进制可执行文件,而无需虚拟机或双启动。

WSL的主要功能和优点包括:

1. 在Windows系统内部运行一个真正的Linux环境,包括Linux内核和命令行工具。
2. 无缝地在Windows系统文件和Linux环境文件之间互相访问和操作。
3. 直接在Windows命令行(CMD或PowerShell)中运行Linux命令和程序。

如果你的电脑系统为 Windows 11 或 Windows 10 较新版本且性能配置较高，可以考虑使用 Windows Subsystem for Linux 来创建虚拟机。

相比 VMWare 它具有以下优势：
- 无需 2.xG 的镜像文件
- 启动快
- 安装/卸载方便
- 与 Windows 融合度高
- ...

目前还没有找到适合推荐的 WSL 配置教程，你可以自行参考以下链接来进行 WSL2 Ubuntu 18.04 的安装

[1] <https://zhuanlan.zhihu.com/p/377263437>  
[2] <https://sspai.com/post/74167>  
[3] <https://zhuanlan.zhihu.com/p/348813745>  
[4] <https://blog.csdn.net/qq401195092/article/details/133717025>  
[5] <https://blog.csdn.net/microsoft_mos/article/details/123627295>   -->

### 1.2 Linux 命令行操作

尽管现代 Linux 操作系统大多都搭配的方便易用的 GUI 图形界面，但是对于开发来说快速便捷的 CLI 指令依然是必不可少的得力助手。

#### 我应该在哪里输入命令？

在你已经启动了的 Ubuntu 系统桌面上：

- 按下键盘上的 ctrl 和 alt 和 T 键；
- 按下 windows 键并输入 terminal 最后按回车键；

就会打开 Ubuntu 的命令行窗口，从这里输入你的命令就好。

> 如果你使用 WSL，那么打开的命令窗口就是 Ubuntu 中的终端。

#### 什么是命令，有哪些，我要怎么学习？

由于能力限制，我们无法在这里直接讲述开发中最常见的 Linux 命令以及该如何学习/使用他们。但是可以把[这份教程](https://www.freecodecamp.org/chinese/news/command-line-for-beginners/)推荐给你。

:::tip
另外我们也支持你自己在搜索引擎上搜索不同的 Linux 命令或在虚拟机上亲手看看它们如何工作，毕竟对代码开发的**耐心与兴趣**才是最能保持热情与动力的。
::: -->

### 1.2 Visual Studio Code安装及其配置

说到集成开发环境，相信大多数人接触到的都是 Dev C++、Clion(IDEA) 或者 Visual Studio。但你对以上所列举的软件并不熟悉或不怎么上手的话，可以考虑学习一下 Visual Studio Code（下称 VSC）。 

![vsc 的用户界面图](./../../assets/images/2024-learning-roadmap/vsc-ui.png)

<p align="center">VSC 的用户界面图</p>

#### 安装

> 在[这里](https://vscode.cdn.azure.cn/stable/1a5daa3a0231a0fbba4f14db7ec463cf99d7768e/code_1.84.2-1699528352_amd64.deb)下载 VSC Linux 安装包（deb）  
> 在[这里](https://vscode.cdn.azure.cn/stable/1a5daa3a0231a0fbba4f14db7ec463cf99d7768e/VSCodeUserSetup-x64-1.84.2.exe)下载 VSC Windows（exe）

Windows 安装的过程不多复述，双击 exe 文件并进行安装就好。

至于 dpkg 的安装，你可以搜索 [ubuntu 安装 deb 包](https://www.bing.com/search?q=ubuntu+%E5%AE%89%E8%A3%85+deb+%E5%8C%85) 来获取相关信息。

完成后，你可以在终端内执行 `code` 或者在应用列表内找到 VSC 图标来打开它。

#### 配置

参考[这篇教程](./../综合/ros-vsc-setup)来配置在 VSC 上进行 ROS 开发。  
参考[这篇教程](./../综合/vsc-c-c++-dev-and-debug)来配置在 VSC 上进行 C/C++ 开发。

<!-- ### 1.4 Linux 下代理的配置

此部分请移步至[这里](./../综合/setting-up-proxy-on-linux)查看。 -->

## 2. 编程语言基础概念

如果你是大一新生，那么你很可能在学习公共课——大学 C 语言。如果你觉得跟上课程内容很容易而且有意思，那么跟着听没问题。  
但如果你觉得听不懂/没意思/想拓展，这些有一些书可以帮到你。

- Essential C++

- C++ Primer Plus

## 3. git使用
 
git 是一个分布式的代码版本控制系统。

通过使用 git 你可以一键将自己的代码回退至任意版本。而且借助 git 的“分支”功能，你可以在不影响主要代码的情况下向代码添加新的功能并测试。  

学习并尝试使用 git 进行代码管理。在 HUAT-FSAC 团队开发项目中，用 git 托管代码是必不可少的。

[在网页上即刻体检 git 操作](https://learngitbranching.js.org/?locale=zh_CN)

关于 git 的详细教程请参考[这个](https://zhuanlan.zhihu.com/p/478860779)。

## 4. ROS 架构熟悉

:::tip[任务]
这一部分指南包含要完成的任务，请认真阅读下列内容并按要求完成任务。
:::

### 4.1 ROS 介绍

ROS 是一个适用于机器人的开源的元操作系统。它提供了操作系统应有的服务，包括硬件抽象，底层设备控制，常用函数的实现，进程间消息传递，以及包管理。 [详情参考](https://wiki.ros.org/cn/ROS/Introduction)

### 4.2 ROS 实践

建议参考[官网的教程](https://wiki.ros.org/cn/ROS/Tutorials)来完成下列任务：

如果遇到未知问题，请首先尝试自行搜索报错信息等。实在无法解决则建议向车队成员寻求帮助。

1. ROS 环境搭建与配置  
    - 安装 ROS **Melodic**  
      安装教程请参考[ROS1 (Melodic) 安装教程](./../综合/ros-installing)
    - 运行 ROS 中内置的 turtle_sim 程序包
    - **完成后上传结果至 QQ 群作业。**
<!-- 2. 创建自己的 ROS 程序包
    - 在目录下创建 ROS 工作空间； 
    - 创建自己的程序包；
    - 在工作空间中编译运行程序包；
    - 最后截图并上传结果至群作业。 -->

### 4.3 了解 ROS 节点通信

参考以下链接，尝试理解 ROS 节点间是以何种方式实现通信。

[1] <https://wiki.ros.org/cn/ROS/Tutorials/UnderstandingNodes>  
[2] <https://wiki.ros.org/cn/ROS/Tutorials/UnderstandingTopics>  
[3] <https://wiki.ros.org/cn/ROS/Tutorials/WritingPublisherSubscriber%28c%2B%2B%29>

通过以上学习步骤，你将逐步掌握机器人操作系统ROS的基础知识，为后续的进阶学习奠定坚实基础。实践是提升技能的关键，因此请在学习的同时多进行练习，以加深对所学知识的理解。
