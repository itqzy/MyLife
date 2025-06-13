## 创建项目

**所需条件**

- 最新版本的 Android Studio

使用 Android Studio 提供的 **Empty Activity** 项目模板创建一个 Android 应用。

1. 在 **Welcome to Android Studio** 对话框中，点击 **New Project**。

   **New Project** 窗口随即会打开，其中列出了 Android Studio 提供的模板。

   在 Android Studio 中，项目模板就是用于为特定类型的应用提供蓝图的 Android 项目。模板可用来创建项目结构以及在 Android Studio 中构建项目所需的文件。选择的模板提供了起始代码，以便能更快上手。

2. 选择 **Phone and Tablet** 标签页。

3. 点击 **Empty Activity** 模板，选择该模板作为项目模板。**Empty Activity** 模板是用于创建简单项目的模板，可以用它来构建 Compose 应用。这个模板只有一个屏幕，并显示 `"Hello` `Android!"` 文本。

4. 点击**下一步**。**New Project** 对话框随即会打开，其中包含一些用于配置项目的字段。

5. 按如下方式配置项目：

   1. **Name** 字段用于输入项目名称。
   2. **Package name** 字段用于指定文件在文件结构中的组织方式。
   3.  **Save location** 字段用于指定保存与项目相关的所有文件的位置。
   4. [Minimum SDK](https://developer.android.com/guide/topics/manifest/uses-sdk-element?hl=zh-cn) 字段用于指定可运行应用的最低 Android 版本。

6. 点击 **Finish**完成创建。

## 基础模板

打开 `MainActivity.kt` 文件的 **Code** 视图。请注意，此代码中有一些自动生成的函数，具体而言就是 `onCreate()` 和 `setContent()` 函数。

```ko
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GreetingCardTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Greeting("Android")
                }
            }
        }
    }
}
```

### onCreate()

`onCreate()` 函数是此 Android 应用的入口点，并会调用其他函数来构建 UI。在 Kotlin 程序中，`main()` 函数是执行的入口点/起点。在 Android 应用中，则是由 `onCreate()` 函数来担任这个角色。

### setContent() 

 [`setContent()`](https://developer.android.com/reference/kotlin/androidx/compose/ui/platform/ComposeView?hl=zh-cn#setContent(kotlin.Function0)) 函数用于通过可组合函数定义布局。任何标有 `@Composable` 注解的函数都可通过 `setContent()` 函数或其他可组合函数进行调用。该注解可告知 Kotlin 编译器 Jetpack Compose 使用的这个函数会生成 UI。

```kotlin
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}
```

### Greeting() 

`Greeting()` 函数是一种可组合函数；请留意它上方的 `@Composable` 注解。此可组合函数会接受一些输入并生成屏幕上显示的内容。

修改文字内容Android 会自动更新预览。

### GreetingPreview()

`GreetingPreview()` 函数无需构建整个应用就能查看可组合函数的外观。如需实现可组合函数的预览，需要添加 `@Composable` 和 `@Preview` 注解。`@Preview` 注解会告知 Android Studio 此可组合函数应显示在此文件的设计视图中。

`@Preview` 注解可以接收名为 `showBackground` 的参数。如果 `showBackground` 设置为 **true**，则会向可组合函数预览添加背景。

```kotlin
@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    GreetingCardTheme {
        Greeting("Android")
    }
}
```

## 设置背景颜色

需要使用 [`Surface`](https://developer.android.com/reference/kotlin/androidx/compose/material/package-summary?hl=zh-cn#Surface(androidx.compose.ui.Modifier,androidx.compose.ui.graphics.Shape,androidx.compose.ui.graphics.Color,androidx.compose.ui.graphics.Color,androidx.compose.foundation.BorderStroke,androidx.compose.ui.unit.Dp,kotlin.Function0)) 将文本包围起来。`Surface` 是一个容器，代表界面的某一部分，您可以在其中更改外观（如背景颜色或边框）。

1. 按下 `Alt+Enter` (Windows) 或 `Option+Enter` (Mac)，然后选择 **Surround with widget**。
2. 选择 **Surround with Container**。
3. 默认容器为 `Box`，可以将其更改为其他容器类型。 删除 `Box`，改为输入 `Surface()`。
4. 向 `Surface` 容器添加 `color` 参数，将其设置为 `Color`。

```kotlin
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Surface(color = Color.Yellow) {
        Text(
            text = "Hello $name!",
            modifier = modifier
        )
    }
}
```

## 添加内边距

[`Modifier`](https://developer.android.com/reference/kotlin/androidx/compose/ui/Modifier?hl=zh-cn) 用于扩充或修饰可组合项。其中一个修饰符是 `padding` 修饰符，它会在元素周围添加空格（在本例中，是在文本周围添加空格）。使用 [`Modifier.padding()`](https://developer.android.com/reference/kotlin/androidx/compose/ui/Modifier?hl=zh-cn#(androidx.compose.ui.Modifier).padding(androidx.compose.ui.unit.Dp)) 函数。

每个可组合函数都应具有 `Modifier` 类型的可选参数。这应是第一个可选参数。

```kotlin
@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Surface(color = Color.Yellow) {
        Text(
            text = "Hello $name!",
            modifier = modifier.padding(24.dp)
        )
    }
}
```

