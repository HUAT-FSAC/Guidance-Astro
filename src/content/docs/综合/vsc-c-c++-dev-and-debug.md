---
title: 在 Visual Studio Code 上进行 C/C++ 开发与调试
Author: NekoRectifier
---

# 还未完成

## 前言

VSC 相比 Clion/Visual Studio 来说仅仅是个简单的代码编辑器，默认并不具备 C/C++ 代码的编译/调试等功能。但如果你想要在 VSC 上实现这样的功能的话，你可以参考如下内容进行。

## 安装 Windows 平台下 C/C++ 编译器

在此我推荐 [Winlibs](https://winlibs.com/) 作为 Windows 上最适合使用的编译器。  
它集合了 GCC/Clang 两大编译器，并且整合了 MinGW-w64、LLVM、GDB与LLDB。仅一次安装就可以部署好 C/C++ 编译的大部分软件与环境。

### 部署

在上面的官网下载压缩包，解压后设置系统 PATH 路径至解压后目录的 `/bin` 下。

### 检查

打开 cmd / PowerShell 输入以下命令测试：

```shell
gcc --version
clang++ --version
```

若正常输出 gcc 与 clang 的版本信息即为安装成功。

## 配置 Visual Studio Code 开发环境

在常见的开发印象中，“编译”就应该是有一个对应的按钮🔘来解决的事情。不过在 VSC 中要想实现这一点得提前做点配置。

### 设置 tasks.json

[官方指南](https://code.visualstudio.com/docs/editor/tasks)

用 VSC 打开一个你准备好的空目录，新建一个 `.vscode/` 目录，在其中新建一个 `tasks.json` 文件。将以下内容复制进去：

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0", // 指定版本
    "tasks": [
        {
            "label": "Build", // 任务的标签/或者说名称
            "type": "process", // 任务的类型，简的来说不是能在 shell 中完成的都要写成 “process”
            "command": "clang", // 调用编译器的命令
            "args": [ // 编译参数
                "-g", // C/C++ 调试的 flag
                "${file}", // file 变量，相当于目前正在编辑文件的绝对路径
            ],
        }
    ]
}
```

