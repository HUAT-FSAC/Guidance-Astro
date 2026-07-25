import torch
from torchvision import datasets, transforms

### 定义数据预处理方式

transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])

### 导入 MNIST 数据集

train_dataset = datasets.MNIST(root='./data', train=True, transform=transform, download=True)
test_dataset = datasets.MNIST(root='./data', train=False, transform=transform, download=True)

### 划分数据集

train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=64, shuffle=True)
# 定义神经网络模型：在 Pytorch 中定义一个神经网络模型，包括输入、隐藏层和输出层。在此示例中，我们使用两个隐藏层。
import torch.nn as nn
import torch.nn.functional as F

### 定义神经网络模型

class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc1 = nn.Linear(28 * 28, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 10)

    def forward(self, x):
        x = x.view(-1, 28 * 28)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return F.log_softmax(x, dim=1)

### 实例化模型

model = Net()
device = device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 定义损失函数和优化器：在 Pytorch 中定义损失函数和优化器，用于训练模型。在此示例中，我们使用交叉熵损失函数和随机梯度下降优化器。
import torch.optim as optim

### 定义损失函数和优化器

criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(model.parameters(), lr=0.01, momentum=0.5)
# 训练模型：使用 Pytorch 训练模型，包括循环遍历训练数据、计算损失、反向传播和更新权重。

### 训练模型

for epoch in range(10):
    running_loss = 0.0
    for i, (inputs, labels) in enumerate(train_loader, 0):
        # 将输入和标签放入 GPU 中（如果有的话）
        inputs, labels = inputs.to(device), labels.to(device)

        # 梯度清零
        optimizer.zero_grad()

        # 前向传播、计算损失和反向传播
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()

        # 更新权重
        optimizer.step()

        # 记录损失
        running_loss += loss.item()

        # 每 2000 批次打印一次训练状态
        if i % 2000 == 1999:
            print('[%d, %5d] loss: %.3f' % (epoch + 1, i + 1, running_loss / 2000))
            running_loss = 0.0
# 测试模型：使用 Pytorch 测试模型，包括循环遍历测试数据、计算模型输出和计算准确率。

### 测试模型

correct = 0
total = 0
with torch.no_grad():
    for (inputs, labels) in test_loader:
        # 将输入和标签放入 GPU 中（如果有的话）
        inputs, labels = inputs.to(device), labels.to(device)

        # 计算模型输出
        outputs = model(inputs)

        # 计算准确率
        _, predicted = torch.max(outputs.data, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
