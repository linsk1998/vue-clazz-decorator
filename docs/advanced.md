# 进阶用法

本章涵盖构建方式等进阶用法。

------------

## reflect-metadata代码迁移

`"@rollup/plugin-inject"` 插件可以进行配置

```javascript
const inject = require("@rollup/plugin-inject");

module.exports = {
    plugins: [
        inject({
            modules: [
                'Reflect.metadata': "vue-clazz-decorator"
            ]
        })
    ];
};
```

编译前

```javascript
Reflect.metadata('foo', "bar");
```

```javascript
import { metadata } from "vue-clazz-decorator";

metadata('foo', "bar");
```

