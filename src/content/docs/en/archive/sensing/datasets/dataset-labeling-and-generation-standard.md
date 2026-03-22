---
title: Dataset Labeling and Generation Standard
---

_Originally defined on 2023-03-26_

## Dataset Labeling Standard

### Naming rules for raw images and annotation files

1. Naming

    As shown in the figure, numbering should start from zero for every item.

    ![naming_standard](@assets/docs/archive/dataset-standard/naming_standard.png)

### Annotation-content rules

2. Annotation contours must be accurate, contain no unrelated objects, and all manual labels must belong to the following list:
    - road
    - carv
    - person
    - vegetation
    - building
    - sky
    - motorcycle

    > If an annotation does not satisfy these rules, detect and correct it with the available tools before submission.

3. Annotation order must follow the rule farther first, nearer later. Distant objects must not cover nearby ones, otherwise the covered area becomes **invalid** in the final generated dataset.

4. Cone annotations should be as accurate as possible. Do not use a rough triangle to approximately cover the cone region.

5. Very complex shapes and unnecessary objects may be left unlabeled, but the rule for skipping them must stay consistent within the same annotation batch.

![example](@assets/docs/archive/dataset-standard/unnecessary-label.png)

## Dataset Generation Standard

0. As of revision 0 (2023-03-26), the generated dataset should follow the basic directory structure of the [Cityscapes](https://www.cityscapes-dataset.com/) dataset.

1. The dataset must satisfy the predefined image size, such as `1920 * 1080`.

2. Generated dataset groups should use the [NATO Phonetic Alphabet](https://www.nato.int/nato_static_fl2014/assets/pdf/pdf_2018_01/20180111_nato-alphabet-sign-signal.pdf). The `train` directory uses names in **forward** order, while the `val` directory uses names in **reverse** order.

    Because of this, the total number of groups in one generation run must not exceed 26.

3. There is no fixed upper limit on the number of images inside each group.
