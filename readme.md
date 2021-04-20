# Listener
一个chrome插件, 用于监听网络流, 并生成相应HTTP请求的JavaScript,request代码.

## 安装
打开chrome扩展程序页面, 选中开发者选项, 加载已解压的扩展程序. 在浏览文件夹中选中Listener文件夹, 点击确定.


## 使用
### 开始
打开开发者工具, 打开listener面板, 点击start, 开始监听网络流. stop停止监听.单击每条记录的会展开详细信息.


### 搜索
点击Search, 展开搜索面板.

set cookie会过滤出有set cookie的返回

URL, 过滤URL包含关键词的网络流

Response, 过滤Response body包含关键词的网络流

Request, 过滤POST请求中Request的body包含关键词的网络流Response, 过滤Response字段

Header, 过滤Header

Cookie, 过滤Cookie

referer-chain, 当选中请求A的时候, 按照A中的referer选中其指向的请求.

cookie-chain, 当选中请求A的时候将返回中set了A中的cookie的请求自动选中.

### 选择

选中每个条目左边的复选框, 改条就会保存到右侧.
在右侧可以拖动改变顺序


### 生成代码

- 生成co代码

单击generate会生成js的request代码, 并按拍好的顺序放入co中.

- 生成es6代码
  
单击generate es6 code 生成 async/await 风格的代码.

- 复制har原文本

复制chrome浏览器生成的har格式json.

- 获取request jar格式的cookie

单击generateCookies会生成js的request的jar格式的cookie.


