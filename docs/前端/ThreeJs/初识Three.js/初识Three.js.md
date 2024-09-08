# 初识Three.js

## 简单创建一个Node.js项目

通过`npm init -y`可以在当前文件夹生成`package.json`文件来快速创建一个**[Node.js](https://nodejs.org/zh-cn)**项目。

创建好后会生成2个文件和一个目录，`node_modules`、`package-lock.json`、`package.json`。

- **node_modules** 是依赖的npm包。
- **package-lock.json** 是锁定安装时的包的版本号，以保证其他人在`npm install`时大家的依赖能保证一致。这是可选的。
- **package.json** 包含与项目相关的各种信息。该文件提供给 npm 的信息使其能够识别并处理项目的依赖关系。

## 通过vite构建项目

通过`npm install vite`安装**[vite](https://vitejs.cn/vite5-cn/)**依赖。

然后我们需要修改**package.json**中的**scripts**删除掉`test`这个脚本。

![image-20240904233935518](./img202409051406495.png)

并添加 

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
```

就可以通过`npm run dev`和`npm run build` 来运行和编译项目了。

当然也可以叫` "start": "vite"` 这个无所谓看个人习惯。我比较习惯叫`dev`



## 安装Three.js

通过`npm install three` 命令来安装Three.js。

通过`import * as THREE from 'three';`在js文件中导入Three.js

这样就简单的导入了Three.js的依赖了



## 创建一个简单的场景

创建一个简单的场景需要4个元素

- Scene 场景
- Objects 对象
- Camera 相机
- Renderer 渲染器

### 场景

场景就像一个容器，我们把物体、粒子、灯光等放进去。

### 对象

对象可以是很多东西如原始几何、模型、粒子、光线等。

下面创建一个简单的红色立方体

在Three.js中这样的可见物体被称为**网格**，它是几何物体（形状）和材料（外观）的组合

### 相机

渲染时理论上可以使用多个相机，但通常都是使用一个。

Three,js中有两种相机：

1. **正交投影相机（OrthographicCamera）**这种投影模式下，无论物体距离相机距离远或者近，在最终渲染的图片中物体的大小都保持不变。常用于渲染2D场景或者UI元素
2. **透视投影相机（PerspectiveCamera）**近大远小，模拟人眼所看到场景。它是3D场景的渲染中用得最普遍的投影模式。 
   - 透视投影相机`PerspectiveCamera`：视锥体
   - 相机距离物体的位置：`.position`
   - 相机镜头对准哪个物体（坐标）：`.lookAt()`

### 渲染器

用相机拍摄好后画面后，还需要用渲染器显示到浏览器上。渲染器将从相机的角度渲染所看到的场景将结果渲染到画布上，我们可以创建画布也可以让渲染器生成画布然后将画布添加到页面上。

- WebGL渲染器：`WebGLRenderer`
- 设置Canvas画布尺寸：`.setSize()`
- 设置背景颜色： `.setClearColor()`
- 渲染器渲染方法：`.render()`
- 获取画布元素：`.domElement`



## 总结

这样一个简单的场景就创建好了，我们可以在材质增加` wireframe: true` 来看到对象的内部结构

```javascript
//创建材质  material

const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
```

完整代码：https://github.com/itqzy/ThreeJs-Deam/tree/main/01







