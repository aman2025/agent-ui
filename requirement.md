# Create a ai-agent application using Next.js 14
 
根据用户提问， LLM生成对应的组件json结构，application动态渲染json成对应表单UI，用户能够交互，提交上一步数据生成下一步UI，最终结果也是用UI展示。

### Feature 
- 基于ReAct, 有完整的ai-agent闭环，可以reasoning + act + observe 和 loop + environment；可以规划和推理（比如遇到结果不满足时，根据上下文信息推断出需求并继续与LLM交互）
- 定义VM2对应的组件JSON schema，用于LLM返回的json结构和UI界面的渲染; 定义组件解析器
- 如果需要可以参考Generative UI一些原理
- Nextjs后端处理业务逻辑，有对应的tool定义，第三方系统api
- 三层分离：UI 结构、应用状态、客户端渲染各自独立

### VM2 Component 
- 组件定义白名单catalog， 只生成在白名单内的组件，保证安全，防止XSS等
- 动态的UI是声明式，并渲染成对应的React组件
- 不包含javascript
- json结构参考 Google A2UI
- 约定组件id，提交表单action的id，可以匹配
- 扁平组件列表 + ID 引用：便于 LLM 增量生成和流式输出
- 声明式数据：不执行代码，Agent 从客户端的可信组件目录中请求组件


### tool and prompt
- tool的定义，业务说明或流程的定义（添加实例名等）
- 每个工具需要对应第三方系统端点API, 参数约定，返回数据约定等
- 上一步业务对应界面UI是什么；根据上一步的结果返回下一步界面json
- 根据如action_id匹配到对应的工具，调用api，传递表单值作为参数
- prompt
   - UI组件渲染渲染约定
   - system角色定义
   - 举例，输入什么，输出什么


### Architecture
- 关注点分离, 可维护性，模块化
- 存储单个功能实现过程的上下文消息(用户提问，LLM返回消息， 第三方系统返回的数据等)
- 业务准确性：通过预定义模板和严格Schema保证


### tech stack
- Nextjs，JavaScript(jsx)
- shadcn UI，tailwind css, Lucide icon
- Zustand
- Mistral AI
- vm2


### UI
- 这不是传统的chat交互界面，没有连续的chat对话框
- 默认是一个input + send 按钮
- 第二个是动态渲染UI界面，替换默认界面；如果下一个界面替换上一个界面直到完成目前的功能

### Example of creating an instance 
- 1、用户输入 'create an instance' 点击发送
- 2、后端处理：
    - 发送需求给LLM
    - LLM响应json结构UI信息
- 3、前端渲染对应的UI组件
- 4、用户填写填写信息，并点击提交
- 5、后端根据组件中的action_id，
    - 找到对应的tool，
    - 请求第三方系统的api ，并返回结果给后端
     - 后端发送结果给LLM
- 6、LLM响应下个界面的json结构
- 7、前端根据json渲染下一个界面


### Simple Nextjs directory 

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Main page component
├── components/             # React components
│   ├── ui/                 # UI components (shadcn)
├── lib/                    # Utility libraries
├── public/                 # Static assets
├── store/                  # State management
├── utils/                  # Utility functions
├── package.json
├── tailwind.config.js
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── .env
└──  next.config.js
```


