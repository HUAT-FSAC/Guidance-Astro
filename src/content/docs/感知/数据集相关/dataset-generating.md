---
title: 数据集生成
---

强烈建议在阅读 Python 3 入门汇总 或已有 Python 基础的情况下浏览本文。

## 配置环境

> 推荐使用 Anaconda/Miniconda 环境来创建 Python 虚拟环境。

在任意 Python 环境下运行以下命令以安装 CityscapesScript Python 包，生成数据集依赖于包中的生成脚本。故必须安装此包。

```bash
pip install cityscapesscript
```

## 克隆源码

```bash
git clone https://github.com/NekoRectifier/disposable-python-snippet.git
```

完成后打开当前目录下的 `disposable-python-snippet/` 文件夹，其中的 `dataset_gen.py` 就是用于生成数据集的脚本。

## 对 labels.py 修改

由于我们重新制作的数据集中包括了源数据集中没有的标注类型如 `cone` 等，故需要手动在 `cityscapesscripts.helpers.labels.py` 中添加我们自定义的标注。

### 定位文件

在 `cityscapesscript` 包的安装位置下找到 `labels.py` 文件  

通常会在：`{python 安装路径}/python3.x/site-packages/cityscapesscripts/helpers/labels.py`

你也可以通过 IDE 的查找定义功能来确定需要修改的文件。

### 添加标注

修改其内的 `labels` 数组，仿照已有的格式添加自定义标注类型即可。  
其中：

- id 按照已有的顺序递增设置即可

- trainsId 设置用于是否应用在训练中，同样地按照递增顺序设置

- category 是类型，按照已有的类型归类

- catId 相当于 category 的编号，与上同。

- hasInstance 是否有可分辨（多少）的实例（不影响训练）

- ignoreInEval 是否在验证中忽略

- color 是转换彩色图时所使用的颜色（不影响训练）

![label-modify](/./../../../../assets/images/dataset-generating/label-modify.png)

如图即为修改完成。

## 源数据目录配置

在生成数据集之前，需要手动将源数据按照特定的格式放置。（生成代码无法自动索引任意格式）

### 格式

**适用于按人回收标注数据的任务类型（即每人对应一个文件夹，文件夹下有对应 json、png 文件）**

将回收的数据集按如下目录放置：

```text
raw/
 |
 |-0/
 | |-0.png
 | |-0.json
 | |-1.png
 | |-1.json
 | |-xxxx.json
 | |-xxxx.png
 | 
 |-1/
 | |-0.png
 | |-0.json
 | |-1.png
 | |-1.json
 | |-xxxx.json
 | |-xxxx.png
 |
 |-xxx/
```

处理完成后，`/xxx/raw/` 就是数据集源路径。

## 生成目标数据集

```bash
#运行
python ./disposable-python-snippet/dataset_gen.py help
```

此代码将会生成与 cityscapes 数据集格式相同的数据集。通过查看给出的提示开始进行数据集生成。
