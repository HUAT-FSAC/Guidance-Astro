---
title: Ros入门·创建工作空间和运行ros包
---

# 前言


当你开始学习ROS（机器人操作系统）时，第一步通常是创建一个工作空间（workspace），它是你进行ROS开发的主要目录。在工作空间中，你可以组织和管理ROS软件包，构建和运行ROS节点，以及进行ROS相关的开发工作。我们的大致流程为

1.  先创建一个工作空间；
2.  再创建一个功能包；
3.  编辑源文件；
4.  编辑配置文件；
5.  编译并执行。

这篇教程会手把手带你进行一次简单的项目构建。先可以配合[视频](https://www.bilibili.com/video/BV14642137Hn)使用那么现在让我们开始吧。

一、配置相关环境
--------

1\. 确定是否安装ros和cmake，打开终端输入

    rosversion -d cmake --version

会显示类似于这样的界面

![](https://img-blog.csdnimg.cn/direct/aee22b8bd18c4a5ebf82be0603987fcf.png)

如果没有安装ros和ubantu，ros推荐鱼香ros一键安装

    wget http://fishros.com/install -O fishros && . fishros

cmake安装：

    sudo apt updatesudo apt install cmake

二、创建工作空间
--------

### 1.创建工作空间并初始化

首先，我们将创建一个ROS工作空间，并在其中创建一个名为 "src" 的子目录。

在终端中执行以下命令：

    mkdir -p 自定义空间名/srccd 自定义空间名称catkin_make

这将在你的主目录下创建一个名为 "catkin\_ws" 的ROS工作空间，并在其中创建 "src" 目录。接着，执行 "catkin\_make" 命令来编译工作空间。（我这里的工作空间命名为test_ws。）

编译完成后，将在工作空间中生成两个文件夹：

1.  "build" 目录：该目录用于存放构建过程中生成的中间文件和最终生成的目标文件。这些文件包括编译器生成的目标二进制文件、库文件和其他构建过程中生成的临时文件。
    
2.  "devel" 目录：该目录用于存放配置文件，其中包含构建系统需要的环境变量和路径信息。这些配置文件用于后续编译和运行ROS软件包。例如，"devel/setup.bash" 文件包含了设置ROS环境变量的命令，你可以在每次新打开的终端中执行该文件以设置正确的ROS环境。
    

### 2.进入 src 创建 ros 包并添加依赖

进入 "src" 目录，并使用 `catkin_create_pkg` 命令创建一个ROS包。在终端中执行以下命令：

    cd srccatkin_create_pkg 自定义ROS包名 roscpp rospy std_msgs

这些命令将在工作空间下生成一个功能包，该功能包依赖于 "roscpp"、"rospy" 和 "std\_msgs"。其中，"roscpp" 是使用C++实现的库，"rospy" 是使用Python实现的库，"std\_msgs" 是标准消息库。创建ROS功能包时，一般都会依赖这三个库实现基本的功能。

三、HelloWorld(C++版)
------------------

### 1.进入 ros 包的 src 目录编辑源文件

    cd 自定义的包
    

cpp原文件

```cpp
#include <ros/ros.h>#include <std_msgs/String.h> 
int main(int argc, char **argv){    // 初始化ROS节点    
    ros::init(argc, argv, "hello_world_node");     // 创建ROS节点句柄    
    ros::NodeHandle nh;     // 创建一个发布者，发布类型为String的主题    
    ros::Publisher pub = nh.advertise<std_msgs::String>("hello_world_topic", 10);     // 设置循环的频率    
    ros::Rate rate(1); // 发布频率为1Hz     
    
    while (ros::ok())    {        // 创建一个String类型的消息        
        std_msgs::String msg;        
        msg.data = "Hello World";         // 发布消息        
        pub.publish(msg);         // 输出消息到控制台        
        ROS_INFO("Published: %s", msg.data.c_str());         // 按照频率休眠        
        rate.sleep();    
    }     
    return 0;
}
```
* * *

### 2.编辑 ros 包下的 Cmakelist.txt文件

根据视频的讲解寻找到相关的cmake源代码 并且反注释

```cmake
add_executable(步骤3的源文件名  src/步骤3的源文件名.cpp)

target_link_libraries(步骤3的源文件名  ${catkin_LIBRARIES})
```

这里我们来详细的讨论下这两行代码的含义：

1.  add_executable(步骤3的源文件名 src/步骤3的源文件名.cpp)

*   这个命令的作用是告诉CMake要将一个可执行文件添加到构建过程中。
*   `add_executable` 是一个CMake的函数，它接受两个参数。
*   第一个参数是可执行文件的名称，这里使用了"步骤3的源文件名"作为示例。
*   第二个参数是源文件的路径，这里假设源文件位于"src"目录下，并使用了"步骤3的源文件名.cpp"作为示例文件名。
*   这个命令会将源文件编译成一个可执行文件，并将其添加到构建过程中，以便在构建时生成该可执行文件。

1.  target\_link\_libraries(步骤3的源文件名 ${catkin_LIBRARIES})
    
    *   这个命令的作用是将目标文件与指定的库进行链接。
    *   `target_link_libraries` 是另一个CMake的函数，它接受两个参数。
    *   第一个参数是目标文件的名称，这里使用了"步骤3的源文件名"作为示例。
    *   第二个参数是要链接的库，这里使用了`${catkin_LIBRARIES}`作为示例。
    *   `${catkin_LIBRARIES}`是一个变量，它包含了构建过程中所需的ROS相关库。
    *   通过将目标文件与指定的库进行链接，可以确保在运行可执行文件时，所需的库能够正确加载和使用。

**通俗的来说**：当我们编写ROS节点时，需要将源代码编译成可执行文件，并将所需的库与该可执行文件进行链接。这两行CMake代码就是用来完成这个任务的。

### 3.进入工作空间目录并编译

    cd 自定义空间名称catkin_make

这会生成上面提到的 build devel .... 可执行文件就在build文件里面

四 运行程序
------

1\. 打开一个新的终端 输入

    roscore
    

2\. 在打开一个终端 cd到你对应的工作空间然后输入

    source ./devel/setup.bashrosrun 包名 C++节点

source后，在我们输入rosrun后可以按tab键快速补充。这是为什么呢？

source ./devel/setup.bash 的含义是在当前终端会话中加载ROS工作空间的环境设置。

具体来说，这段代码的作用是：

*   `source` 是一个Shell命令，用于执行指定脚本文件中的命令，使其在当前终端会话中生效。
*   `./devel/setup.bash` 是一个脚本文件的路径，它位于ROS工作空间的 `devel` 目录下。
*   `devel/setup.bash` 是ROS构建系统生成的一个脚本文件，其中包含了设置ROS环境变量的命令。

当你运行这段代码时，它会执行 `devel/setup.bash` 脚本文件中的命令，设置当前终端会话的环境变量，以便正确地使用ROS工具和功能。

具体来说，`devel/setup.bash` 脚本文件中的命令会完成以下操作：

*   设置 `ROS_PACKAGE_PATH` 环境变量，指定ROS工作空间的包路径。
*   设置 `ROS_MASTER_URI` 环境变量，指定ROS主节点的URI。
*   设置 `ROS_IP` 或 `ROS_HOSTNAME` 环境变量，指定当前主机的IP地址或主机名。
*   将ROS工作空间的 `bin` 和 `lib` 目录添加到 `PATH` 和 `LD_LIBRARY_PATH` 环境变量中，以确保能够正确找到和加载ROS工具和库文件。

通过运行 `source ./devel/setup.bash`，你可以将ROS工作空间的环境设置加载到当前终端会话中，使得你可以在该终端中使用ROS工具和运行ROS节点。

需要注意的是，每次打开一个新的终端时，都需要运行这段代码，以确保每个终端会话都能正确地加载ROS工作空间的环境设置。

然后我们就可以在终端看到我们发布的 hellowrld！了

![](https://img-blog.csdnimg.cn/direct/c315b89a74ad40cb81959079687ef6df.png)

五 总结问题
------

### 1.问题一：工作空间与软件包的关系与区别
在ROS（机器人操作系统）中，工作空间（workspace）是一个包含多个软件包（packages）的目录。工作空间是一个用于组织和构建ROS项目的容器，它提供了一种管理和编译多个软件包的机制。每个软件包代表着一个独立的功能单元，可以包含节点（nodes）、消息（messages）、服务（services）、动作（actions）以及其他相关文件。  
工作空间可以包含多个软件包，这些软件包可以是你自己编写的或者是从其他人或团队获取的。通过将这些软件包组织在一个工作空间中，你可以方便地进行编译、构建和管理。

* * *

### 问题二：成功编译所需的CMake指令 
在ROS中，CMake是用于构建和编译ROS软件包的工具。下面是一些常用的CMake指令：  
1\. cmake\_minimum\_required(VERSION x.x.x)：指定所需的最低CMake版本。  
2\. project(project_name)：指定项目名称。  
3\. find\_package(package\_name)：查找指定的依赖包。  
4\. add\_executable(executable\_name source_files)：添加一个可执行文件。  
5\. add\_library(library\_name source_files)：添加一个库文件。  
6\. target\_link\_libraries(target\_name library\_names)：将目标文件与指定的库文件进行链接。  
7\. add\_dependencies(target\_name dependency_names)：添加目标文件的依赖。  
8\. catkin_package()：用于构建Catkin软件包时，用于指定包的依赖关系和其他Catkin特定的配置。  
这只是一些常用的CMake指令，具体使用取决于你的项目需求。

* * *

### 问题三：rosrun的实质和devel/lib下的可执行文件
rosrun是ROS中一个常用的命令行工具，用于运行ROS软件包中的节点。它的基本语法是：  
``rosrun package\_name node\_name  
其中，package\_name是要运行的节点所在的软件包的名称，node\_name是要运行的节点的名称。  
当你使用rosrun命令运行一个节点时，ROS会在工作空间的devel/lib目录下查找对应的可执行文件。该目录是在你执行catkin_make或catkin build等构建命令后自动生成的，其中包含了已编译的节点可执行文件。

* * *

### 问题四：为什么有多个cmake文件

在ROS项目中通常会出现多个CMake文件，这是因为ROS项目的结构和功能较复杂，需要分别管理不同的部分和依赖项。以下是常见的几种CMake文件：

1.  `CMakeLists.txt`：这是ROS项目中最常见的CMake文件，位于ROS包的根目录。它用于定义整个ROS包的构建规则、依赖项和其他配置选项。该文件会告诉CMake如何构建该ROS包，包括编译可执行文件、创建库、生成消息和服务文件等。
    
2.  `package.xml`：虽然不是CMake文件，但它是ROS项目中必不可少的配置文件之一。`package.xml` 文件位于ROS包的根目录，用于定义ROS包的元数据、依赖项和其他信息。它描述了ROS包的名称、版本、作者、许可证等重要信息，同时也列出了ROS和其他软件包的依赖关系。
    
3.  `CMakeLists.txt`（子目录）：在ROS包中的子目录中，可能会有额外的CMake文件。这些文件用于定义子目录中特定部分的构建规则和依赖项。例如，如果ROS包有一个独立的节点或库在子目录中，可以在该子目录中创建一个独立的CMake文件来管理该部分的构建过程。
    
4.  `Find<package>.cmake`：这些是用于查找和配置其他非ROS软件包的CMake模块文件。这些文件通常用于在ROS项目中使用外部库或工具，它们提供了与这些库和工具的集成方法。

每个CMake文件都有其特定的作用和范围，它们共同协同工作以构建和管理一个完整的ROS项目。这种分离的方式使得项目的组织和维护更加清晰，并允许不同部分的独立管理和配置。
