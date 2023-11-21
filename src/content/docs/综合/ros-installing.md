---
title: ROS1 (Melodic) 安装教程
---

> ROS 与 Ubuntu 的系统版本严格对应，不可混装。
> 如 `ROS Melodic` 对应 Ubuntu 18.04 LTS

本教程将使用 

- Ubuntu 18.04
- bash (latest)

为基础进行演示。  
在进行操作之前请确保你已经完成了 Ubuntu 的基础设置：语言、时区、`apt` 程序源设定。  

## 操作步骤

1. 配置 Ubuntu 软件仓库（Repositories）  
   
   你可以参考[这里（USTC）](https://mirrors.ustc.edu.cn/help/ros.html)的步骤进行。  
   首先修改 `apt` 包管理器的 `source.list` 添加来自清华镜像的 ROS 源。

   打开终端输入：

    ```bash
      sudo sh -c '. /etc/lsb-release && echo "deb http://mirrors.tuna.tsinghua.edu.cn/ros/ubuntu/ `lsb_release -cs` main" > /etc/apt/sources.list.d/ros-latest.list'
    ```

2. 添加 PGP 密钥

    ```bash
      sudo apt-key adv --keyserver 'hkp://keyserver.ubuntu.com:80' --recv-key C1CF6E31E6BADE8868B172B4F42ED6FBAB17C654

      # 如果上面的不行，尝试使用这个：

      curl -sSL 'http://keyserver.ubuntu.com/pks/lookup?op=get&search=0xC1CF6E31E6BADE8868B172B4F42ED6FBAB17C654' | sudo apt-key add -

      # 如果都不行请尝试使用代理来执行以上命令

    ```

3. 安装 `ros-melodic` 包  
   首先要做的是去更新软件源索引。

    ```bash
      sudo apt update
    ```

    - 「推荐」完整安装

      ```bash
        sudo apt install ros-melodic-desktop-full
      ```

      包含：ROS、rqt、rviz、机器人通用库、2D/3D 模拟器、导航以及 2D/3D 感知包。

    - 桌面版安装

      ```bash
        sudo apt install ros-melodic-desktop
      ```

      包含：ROS，rqt，rviz 和机器人通用库

    以上两种任意选择，在终端执行后即开始安装。

4. 初始化 `rosdep`  
   在你使用 `ROS` 之前，需要初始化 `rosdep`。`rosdep` 让你能够轻松地安装被想要编译的源代码，或被某些 `ROS` 核心组件需要的系统依赖。

    - 用 pip 安装 rosdepc

      [应该如何安装 pip](https://blog.csdn.net/qq_42257666/article/details/117884849)

      在终端中执行 `pip install rosdepc`

      若在安装结束时 pip 给出有关环境变量 “PATH” 的提示，则手动编辑 `~/.bashrc` 文件将 `~/.local/share/bin` 也添加进 PATH 中即可。

      [如何在 bash 中修改 PATH 环境变量？](https://btfy.eu.org/?q=5aaC5L2V5ZyoIGJhc2gg5Lit5L+u5pS5IFBBVEgg546v5aKD5Y+Y6YeP77yf)

    - 运行 rosdepc 进行初始化

      在终端执行 `rosdepc init` 按照提示进行即可。

    {: .warning}
    > 以下步骤已经不再推荐，使用 rosdepc 即可。

    ```bash
      sudo rosdep init
      # 此步需要开启代理或手动修改链接（见下）
      rosdep update
    ```

5. 设置环境  
   通过修改 `.bashrc` 启动脚本，将 `ROS` 环境变量自动添加到 **新 bash** 会话会很方便。

    ```bash
      echo "source /opt/ros/melodic/setup.bash" >> ~/.bashrc
      # 这样就会在每次启动终端时，自动执行加入 ROS 的相关变量
      source ~/.bashrc # 使其当前终端中生效（不必须）
    ```

6. 环境测试  
   在终端中输入 `roscore`，激活 `ROS` 核心。
   再打开一个终端，输入：

    ```bash
      rosrun turtlesim turtlesim_node
    ```

   若正常，应有新窗口打开且显示有一只海龟。
   继续打开新终端，执行：

    ```bash
      rosrun turtlesim turtle_teleop_key
    ```

   这时你的鼠标要停留在当前这个终端界面，按键盘上面的 “上下左右” 来控制海龟的移动。  
   以上内容能实现则说明 `ROS Melodic` 环境已经安装、配置完成了。

7. 卸载 `ros-melodic`（如遇安装出错等情况）

    ```bash
      sudo apt-get remove ros-melodic-*
      # 卸载与 Melodic 相关的所有包
    ```

## 参考链接

【0】<https://blog.csdn.net/hxj0323/article/details/121215992>  
【1】<http://wiki.ros.org/cn/melodic/Installation/Ubuntu>  
【2】<http://wiki.ros.org/cn/ROS/Tutorials>    
【3】<https://blog.csdn.net/qq_44830040/article/details/106049992>  
【4】<https://www.guyuehome.com/10082>  
【5】<https://mirrors.ustc.edu.cn/help/ros.html>