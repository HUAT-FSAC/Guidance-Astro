---
title: ⭐ 数据集标注及生成标准
---

*2023-03-26 制订*

## 数据集标注标准

### 回收的原图片及标注文件规范

1. 名称  
    
    应如图中所示，各项从零开始编号。

    ![naming_standard](./../../../../assets/docs/dataset-standard/naming_standard.png)


### 内容标注规范

2. 标注内容轮廓准确，没有其他物体。且所有人工标注的标签应包含在以下列表内:

    - road
    - carv
    - person
    - vegetation
    - building
    - sky
    - motorcycle

    > 如有标注不满足以上条件，可使用工具检测后做修改。
  
3. 标注顺序应按照 “先远后近” 的原则，远处物体不应覆盖近处的物体，否则最终生成的数据集里被覆盖的部分即为**无效**。

4. 锥桶的标注请尽量准确，避免使用三角形大致包括锥桶所在区域！

5. 过于复杂的形状和不必要的物体可以选择不标注，一次总体标注中针对这些物体的标注规则应当一致。

![example](./../../../../assets/docs/dataset-standard/unnecessary-label.png)

## 数据集生成标准

0. 截至第 0 次修订日期（2023-03-26），生成的数据集格式应与 [CityScapes](https://www.cityscapes-dataset.com/) 数据集基本目录格式相同。

1. 满足预先规定的像素大小，如 1920 * 1080；

2. 生成的数据集各组按照 [NATO Phonetic Alphabet](https://www.nato.int/nato_static_fl2014/assets/pdf/pdf_2018_01/20180111_nato-alphabet-sign-signal.pdf) 设定，`train` 目录以 **正序** 命名；`val` 目录以 **逆序**命名。

    故每次生成时组数不能过多，总数量不得超过26。

3. 每组中的图片数量最大值不做限制。

