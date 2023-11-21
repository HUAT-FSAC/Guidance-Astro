---
title: ⭐ 数据集标注入门 
---

## 1. 为什么需要数据集标注？

HUAT FSAC 车队采用车载摄像头（1900 × 1200 px）来实现[语义分割](https://zhuanlan.zhihu.com/p/46200875)以完成锥桶的颜色识别任务。在此过程中，需要大量带有标注的数据集对模型进行训练。故需要手动进行数据集标注。

## 2. 环境配置

- Python 3.X 环境部署  
  下载：[https://www.python.org/downloads/](https://www.python.org/downloads/)  

  ![download](/./../../../../assets/images/dataset-labeling/python_download.png)

  点击 “Download Python 3.XX.X” 即可开始下载，之后详细安装教程可见[这里](https://zhuanlan.zhihu.com/p/111168324)。

- labelme 下载及安装  
  官网：[https://github.com/wkentaro/labelme/release](https://github.com/wkentaro/labelme/releases)  
  蓝奏云：[https://nekorectifier.lanzouw.com/iMe0I0dk0kpe](https://nekorectifier.lanzouw.com/iMe0I0dk0kpe)

  > ![labelme_releases](/./../../../../assets/images/dataset-labeling/labelme_releases.png)
  > 官网提供了 Linux、Windows、Mac OS 平台的安装包，蓝奏云网盘上有 Windows 平台的安装包。  
  > 任何平台的程序都是完全相同的，在使用上并无差异。

  - GNU/Linux 安装：  

    {: .warning }
    > 目前（2022-12-10）不推荐通过 Github Releases 安装

    在终端输入 `pip install labelme`  
    并等待其安装完成。

    安装完成后，输入 `labelme` 启动程序。

    ![linux-labelme](/./../../../../assets/images/dataset-labeling/linux_labelme.png)

    左为主程序页面，右为安装过程

  - Windows 安装

    在 Github Releases 上选择 “Labelme.exe” 下载打开即可使用。

## 3.labelme-软件使用教程

[labelme](https://github.com/wkentaro/labelme)
是图像注解添加软件，并支持创建多边形、矩形、圆形等多类型的精准图像注解（Annotation）。  
我们所做的的语义分割标注便属于**多边形**注解。

1. 在软件中打开存放原图片的目录；  

   按 “Open Dir” 打开目录。

   ![labelme_open_dir](/./../../../../assets/images/dataset-labeling/labelme_open_dir.png)

2. 选择“标注模式”，进行实例标注；  

   点击 “Create Polygons”，用鼠标🖱️圈出物体轮廓。

   ![labelme_1](/./../../../../assets/images/dataset-labeling/labelme_1.png)

   {: .note }
   > **标注标准操作**：  
   > 先标注相对较远的物体，后标注相对较近的物体。  
   > （**标注的顺序会影响最终标注效果**。先标的物体在“下”，后标的在“上”。顺序不能颠倒！）

3. 标注一个物体完成后，点击第一个创建的点以闭合多边形，完成标注多边形的创建；  

4. 在弹出的窗口中，输入所标注的物体的名称；  

   ![2](/./../../../../assets/images/dataset-labeling/labelme_2.png)

5. 重复以上过程直至标注完成；  

   [🧩查看标注示例视频](https://www.bilibili.com/video/BV18V4y1L7CK)

6. 点击保存或（<key>ctrl</key> + <key>s</key>）将 `json` 文件保存至原图片目录下；

   > `json` 文件名一般情况下不需要修改，保持与图片文件名相同即可。

## 4. 标注审阅

标注过程中免不了会出现错误，可能有误标、漏标、顺序错误等情况。因而需要再次进行审阅以避免错误 **削弱数据集的性能**。

1. 准备环境  
   执行以下命令以安装必要库。

    ```bash
      pip install numpy imgviz labelme
    ```

   并克隆 `wkentaro/labelme` 库至本地。

    ```bash
      git clone https://github.com/wkentaro/labelme.git
    ```

   从[这里](https://nekorectifier.lanzouw.com/i8uaA0dt3gah)下载必须的 labels.txt 文件。

2. 准备数据集  
   将标注好的数据集 json 文件与源图片文件放在同一文件夹中。（在此将其设为 `a/` 文件夹 📁 ）  
   并保证 json 文件与对应的图片文件有相同文件名，具体如下所示：

    ```text
      a/
      |
      |--- 0001.json
      |--- 0001.png
      |--- ...
    ```

3. 转换彩色图  
   使用以下命令运行 `labelme/example/semantic-segmentation/` 下的 `labelme2voc.py`

    ```bash
      python labelme/example/semantic-segmentation/labelme2voc.py --input_dir "a/" --output_dir "output/"  --labels labels.txt
    ```

   转换出的图片应如图所示：

   ![res](https://pan-yz.chaoxing.com/thumbnail/0,0,0/96b705033123c8c05c13b63db9c5777a.png)

4. 审阅转换结果  
   - 依次审阅 `output/SegmentationClassVisualization/` 下的所有图片。  

   - 检查他们的覆盖顺序是否正确，标准与上文的 “标注标准操作” 相同。  

   - **全部检查完毕**后，方可进行数据集转换。
