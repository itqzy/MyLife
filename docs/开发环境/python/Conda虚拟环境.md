

入门python的话，配置环境是第一步，对于很多人来说是难点也是重点。尤其是机器学习，深度学习，数据分析情况下，配置规范，互不冲突的虚拟环境对工作以及开发具有很大的作用。

## **Miniconda安装（不是Anaconda）**

## **Miniconda优点**

### **1. 体积更小**

- Miniconda 是一个精简版的安装器，仅包含了最基本的环境管理工具（conda）和 Python。它的安装包非常小，大约 50MB 左右。
- Anaconda 则包含了大量的预装 Python 库（如 NumPy、Pandas、SciPy、Jupyter Notebook 等），因此安装包较大，通常超过 1GB。

### **2. 灵活性更高**

- Miniconda 只包含最基本的工具和包，这使得用户可以自由选择和安装自己需要的库，而不是一开始就被安装了一堆可能不需要的库。用户可以根据项目的需要选择合适的库，而不是被预装库限制。

### **3. 启动速度更快**

- 由于 Miniconda 在默认安装时不附带大量库，因此它启动速度较快。相比之下，Anaconda 由于包含了很多包，加载和启动时间会更长一些。特别适合开发者在不需要大量科学计算库时使用。

### **4. 减少依赖冲突**

- 由于 Miniconda 从一开始就没有预装大量的包，因此用户可以更好地控制安装的包和版本，减少依赖包之间的冲突。而在需要特定版本的库时，能够更精细地管理依赖包，减少冲突的风险。

### **5. 适合服务器和轻量级环境**

- Miniconda 非常适合用于服务器或者资源较少的设备上，因为它占用的资源非常少，并且用户可以按需安装必要的库。适合在资源有限的系统上快速部署和运行 Python 环境。

## **Miniconda下载**

安装conda软件时，大多数博客或是论坛说的是使用Anaconda，但是我们选择miniconda，官网下载地址为：[Miniconda](https://docs.anaconda.com/miniconda/miniconda-install/)

## **Miniconda添加环境变量**

安装完成miniconda后，找到刚才的安装目录。并将下面三个路径添加到系统的环境变量中。

```bash
D:\APP\Miniconda
D:\APP\Miniconda\Scripts
D:\APP\Miniconda\Library\bin
```

## **新建虚拟环境**

conda新建虚拟环境命令如下：

```
conda create -n new python=3.9
```

虚拟环境名称为new，python环境为3.9。如果想要指定虚拟环境位置可以使用如下命令：

```
conda create --prefix=D:\STUDY python=3.9
```

此时环境名称为STUDY。

## **pip安装第三方包**

安装之前，需要先进入**Anaconda Prompt**或者是cmd界面，然后激活需要安装的虚拟环境，如果从**Anaconda Prompt**进入的话会自动激活base环境，cmd进入则需要先执行

```
activate base
```

然后使用

```
pip install numpy=1.26.4
```

这样会自动进行安装numpy，并且版本为1.26.4，如果不添加版本号的话会自动安装最新版。

同样，卸载的命令为

```
pip uninstall numpy
```

安装完成后，可以输入查看具有的包

```
conda list
```