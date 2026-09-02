# Request — Web 请求 API（Fetch API）

## Example

```js
const request = new Request('https://api.example.com/v1/users?role=admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token_abc123'
  },
  body: JSON.stringify({ name: 'Bob', age: 25 }),
  mode: 'cors',
  credentials: 'include'
});

// 1. url: 获取完整请求地址
console.log(request.url); 
// 输出: "https://api.example.com/v1/users?role=admin"

// 2. method: 获取请求方法（会自动转为大写）
console.log(request.method); 
// 输出: "POST"

// 3. headers: 获取 Headers 对象，可以通过 .get() 提取具体请求头
console.log(request.headers.get('Content-Type')); 
// 输出: "application/json"
```

## Method

### json

解析 JSON 数据

```js
const jsonReq = new Request('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 101, username: 'Alice' })
});

// 解析为 JavaScript 对象
async function handleJson() {
  const data = await jsonReq.json();
  console.log(data.username); // 输出: "Alice"
  
  // 消费一次后，bodyUsed 会变为 true
  console.log(jsonReq.bodyUsed); // 输出: true
}

handleJson();
```

### text

解析为纯文本

```js
const textReq = new Request('/api/log', {
  method: 'POST',
  body: 'System Error Log: Connection timeout.'
});

async function handleText() {
  const logMessage = await textReq.text();
  console.log(logMessage); // 输出: "System Error Log: Connection timeout."
}

handleText();
```

### formData

解析表单数据

```js
const formData = new FormData();
formData.append('username', 'Charlie');
formData.append('avatar', fileInput.files[0]); // 假定页面有一个文件输入框

const formReq = new Request('/api/upload', {
  method: 'POST',
  body: formData
});

async function handleFormData() {
  const data = await formReq.formData();
  console.log(data.get('username')); // 输出: "Charlie"
  console.log(data.get('avatar'));   // 输出: File 对象
}

handleFormData();
```

### clone

请求体（Body）是一个一次性消耗的流（Stream）。一旦调用了 `.json()` 或 `.text()`，该请求体就被“打卡标记”为以使用，无法二次读取。如果需要复用请求，必须提前克隆：

```js
const originalReq = new Request('/api/data', {
  method: 'POST',
  body: JSON.stringify({ msg: 'Hello World' })
});

// 克隆一个新的 Request 对象
const clonedReq = originalReq.clone();

// 分别读取两个请求的 Body
async function readBoth() {
  const data1 = await originalReq.json();
  const data2 = await clonedReq.json();

  console.log(data1.msg); // 输出: "Hello World"
  console.log(data2.msg); // 输出: "Hello World"
}

readBoth();

// 💡 错误示例：如果试图重复读取同一个未克隆的请求：
// await originalReq.json();
// await originalReq.json(); // ❌ 会抛出 TypeError: Failed to execute 'json' on 'Request': body stream already read
```

