---
title: Dataset Generation
---

It is strongly recommended to read the Python introductory guide first, or at least make sure you are already comfortable with basic Python workflows.

## Environment Setup

> Using an Anaconda or Miniconda environment is the most practical way to manage the required Python packages.

Install the `cityscapesscript` package in any Python environment. The dataset-generation workflow depends on scripts from this package, so this dependency is required.

```bash
pip install cityscapesscript
```

## Clone the Source Repository

```bash
git clone https://github.com/NekoRectifier/disposable-python-snippet.git
```

After cloning, open the `disposable-python-snippet/` directory. The `dataset_gen.py` script inside it is the tool used to generate the dataset.

## Update `labels.py`

Because the relabeled dataset contains custom classes that do not exist in the original dataset, such as `cone`, you need to add those labels manually in `cityscapesscripts.helpers.labels.py`.

### Locate the file

Find `labels.py` inside the installed `cityscapesscript` package.

It is typically under:

`{python-install-path}/python3.x/site-packages/cityscapesscripts/helpers/labels.py`

You can also use your IDE's go-to-definition feature to locate the exact file that needs to be edited.

### Add custom labels

Modify the `labels` array by following the existing format and appending your custom label types.

Notes for the fields:

- `id`: increase it according to the existing order
- `trainId`: set whether the label is used in training, also following the current order
- `category`: assign the label to an existing category type
- `catId`: the numeric identifier of that category
- `hasInstance`: whether the label represents countable instances
- `ignoreInEval`: whether the label should be ignored during evaluation
- `color`: the visualization color used when converting labels to a color map

![label-modify](@assets/docs/archive/dataset-generating/label-modify.png)

The screenshot above shows a completed example.

## Configure the Raw Data Directory

Before generating the final dataset, the source data must be placed in a predefined directory structure. The generation script cannot automatically index arbitrary folder layouts.

### Expected format

**This format is intended for tasks where annotation files are collected per person, with each person contributing one folder that contains matching `json` and `png` files.**

Arrange the raw data like this:

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

After preparation, `/xxx/raw/` becomes the source path for the dataset.

## Generate the Target Dataset

```bash
python ./disposable-python-snippet/dataset_gen.py help
```

The script generates a dataset in a structure compatible with the Cityscapes format. Use the help output to start the actual dataset-generation process.
