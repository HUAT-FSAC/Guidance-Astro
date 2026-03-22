---
title: 'ROS Basics: Create a Workspace and Run a ROS Package'
---

When you start learning ROS, one of the first practical steps is creating a workspace. A workspace is the main directory where you organize packages, build code, and run ROS nodes.

A simple workflow looks like this:

1. create a workspace
2. create a package
3. edit the source file
4. edit the configuration file
5. build and run

This guide walks through a minimal example. You can also follow it together with [this video](https://www.bilibili.com/video/BV14642137Hn).

## 1. Prepare the environment

First check whether ROS and CMake are already installed:

```bash
rosversion -d
cmake --version
```

You should see output similar to the screenshot below.

![version-check](@assets/docs/archive/ros-toturial-creating-ws-and-package/version-check.png)

If ROS is not installed yet, the team recommends the fishros one-click installer:

```bash
wget http://fishros.com/install -O fishros && . fishros
```

Install CMake if needed:

```bash
sudo apt update
sudo apt install cmake
```

## 2. Create a workspace

### 2.1 Create and initialize the workspace

Create a ROS workspace and a `src` subdirectory inside it:

```bash
mkdir -p {your_workspace_name}/src
cd {your_workspace_name}
catkin_make
```

This creates the workspace structure and builds it once.

> In the original example, the workspace name is `test_ws`.

After the first build, several directories appear:

1. `build`: intermediate files and generated build artifacts
2. `devel`: generated environment files and configuration scripts used when running packages

In particular, `devel/setup.bash` is important because it configures the environment for later work.

### 2.2 Create a package inside `src`

Move into `src` and create a ROS package with common beginner dependencies:

```bash
cd src
catkin_create_pkg {your_package_name} roscpp rospy std_msgs
```

This creates a package that depends on `roscpp`, `rospy`, and `std_msgs`.

- `roscpp` is the C++ ROS client library
- `rospy` is the Python ROS client library
- `std_msgs` provides common standard message types

These are common defaults for beginner ROS packages.

## 3. Hello World in C++

### 3.1 Create the source file

Enter the package directory and create a C++ source file:

```bash
cd {your_package_name}
```

Example source:

```cpp
#include <ros/ros.h>
#include <std_msgs/String.h>
int main(int argc, char **argv){
    ros::init(argc, argv, "hello_world_node");
    ros::NodeHandle nh;
    ros::Publisher pub = nh.advertise<std_msgs::String>("hello_world_topic", 10);
    ros::Rate rate(1);

    while (ros::ok()) {
        std_msgs::String msg;
        msg.data = "Hello World";
        pub.publish(msg);
        ROS_INFO("Published: %s", msg.data.c_str());
        rate.sleep();
    }
    return 0;
}
```

### 3.2 Edit `CMakeLists.txt`

Uncomment or add the relevant build lines as shown in the tutorial video:

```cmake
add_executable(步骤3的源文件名  src/步骤3的源文件名.cpp)

target_link_libraries(步骤3的源文件名  ${catkin_LIBRARIES})
```

What these lines do:

1. `add_executable(...)`
    - tells CMake to build an executable from the source file
    - the first argument is the executable name
    - the second argument is the source-file path

2. `target_link_libraries(... ${catkin_LIBRARIES})`
    - links the executable against the ROS libraries required by the package

In simple terms: you compile your node into a runnable program and link it with the libraries ROS needs.

### 3.3 Build from the workspace root

Return to the workspace root and build:

```bash
cd {your_workspace_name}
catkin_make
```

This generates directories such as `build`, `devel`, and `logs`. The resulting executable is produced during the build process.

## 4. Run the program

1. Open a new terminal and start the ROS core:

```bash
roscore
```

2. Open another terminal, go to the workspace, and run:

```bash
source ./devel/setup.bash
rosrun {package_name} {cpp_node_name}
```

After `source ./devel/setup.bash`, tab-completion for `rosrun` works because the ROS environment variables are loaded into the current shell session.

That script typically sets:

- `ROS_PACKAGE_PATH`
- `ROS_MASTER_URI`
- `ROS_IP` or `ROS_HOSTNAME`
- the workspace `bin` and `lib` paths

Every new terminal needs the environment sourced again if you want it to know about your workspace.

When everything works, the terminal should print the `Hello World` messages.

![output](@assets/docs/archive/ros-toturial-creating-ws-and-package/output.png)

## 5. Summary questions

### 5.1 What is the relationship between a workspace and a package?

A workspace is a container for one or more ROS packages. It gives you a place to organize, build, and manage them together. A package is a smaller functional unit inside that workspace and may contain nodes, messages, services, actions, and related files.

### 5.2 Common CMake commands used in ROS

Some frequently seen CMake commands are:

1. `cmake_minimum_required(VERSION x.x.x)`
2. `project(project_name)`
3. `find_package(package_name)`
4. `add_executable(executable_name source_files)`
5. `add_library(library_name source_files)`
6. `target_link_libraries(target_name library_names)`
7. `add_dependencies(target_name dependency_names)`
8. `catkin_package()`

The exact combination depends on your package requirements.

### 5.3 What does `rosrun` actually do?

`rosrun package_name node_name` searches for the node executable inside the built workspace, typically under locations prepared by Catkin such as `devel/lib`, then launches it with the proper ROS environment.

### 5.4 Why are there multiple CMake files in ROS projects?

ROS projects often contain multiple CMake-related files because different parts of the project manage different responsibilities.

1. `CMakeLists.txt` at the package root defines the main build rules and dependencies.
2. Additional `CMakeLists.txt` files may appear in subdirectories to manage separate libraries or tools.
3. `Find<package>.cmake` modules help CMake discover and configure external libraries.

This separation keeps larger projects easier to organize and maintain.
