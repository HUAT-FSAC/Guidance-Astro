---
title: 神经网络环境搭建及 MNIST 数据集训练与验证
---

## 概述

[MNIST 数据集](https://en.wikipedia.org/wiki/MNIST_database) 是一个由大量手写数字组成的数据集，常用于各类图片处理系统的训练。
本文尝试引导你借助 [Pytorch](https://pytorch.org/) 来搭建一个神经网络并通过训练来完成手写数字的识别（分类）任务。

## 配置环境

### 要求

- 建议使用 Linux 系统 (主流发行版即可,如 Ubuntu 18/20/22.04)

- 有 Linux 基本操作基础

- 有 Python3 基础

- 对人工神经网络有基础了解

- 有张不过时的显卡会相比 CPU 计算好很多 (笔记本/台式机都可)

### 软件部署

1. (可选) NVidia GPU 驱动安装

    教程见：<https://blog.csdn.net/Perfect886/article/details/119109380>

    在终端输入 `nvidia-smi` 查看，如显示如下则驱动安装正常。

    ![nvidia-smi](/assets/images/neural-network-train-and-vaildate-on-mnist/nvidia-smi.png)

    如果没有合适显卡也可以直接跳过这步，直接采用 CPU 进行计算。

2. Python 环境配置 (Anaconda / Miniconda)

    可以[在此](https://repo.anaconda.com/archive/)下载系统对应的安装程序，直接执行安装即可。

    安装后还要进行“换源”操作避免无法下载包的情况产生。

3. Pytorch 安装

    > 虽然是叫 ‘Pytorch’ 但是它在 pip 中的包名是 ‘torch’ 不要弄错了。
    > ![pytorch-error](/assets/images/neural-network-train-and-vaildate-on-mnist/pytorch-error.png)
    > 否则报错如图

    详细教程可见 <https://blog.csdn.net/qq_45281807/article/details/112442423>

4. 测试安装

    在终端内执行以下语句：

    ```bash
    python # 进入 Python 环境

    import torch # 没有报错则 Pytorch 安装正常
    torch.cuda.is_available()
    
    # 如果返回 True 则 CUDA/NVidia部分安装正常；否则是使用 CPU 进行推理或者 CUDA 安装失败
    ```

## 程序编写

可运行的代码在这里，[CPU版](/assets/code/neural-network-train-and-vaildate-on-mnist/train_cpu.py);[GPU版](/assets/code/neural-network-train-and-vaildate-on-mnist/train_cpu.py)
