/**
 * @Date        2024/10/24 18:34:05
 * @Author      zono
 * @Description reactive system
 * 基于《Vue设计与实现》第四章内容，实现一个简单的响应式系统
 * */

const bucket = new WeakMap(); // 存储副作用函数的桶

const track = (target, key) => {
	if (!activeEffect) return; // 没有activeEffect，则不进行依赖收集
	let depsMap = bucket.get(target);
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()));
	}
	let deps = depsMap.get(key);
	if (!deps) {
		depsMap.set(key, (deps = new Set()));
	}
	deps.add(activeEffect);
};

const trigger = (target, key) => {
	const depsMap = bucket.get(target);
	if (!depsMap) return;
	const deps = depsMap.get(key);
	if (!deps) return;
	for (const effect of deps) {
		effect();
	}
};

// 定义一个全局变量来存储当前的 activeEffect
let activeEffect;

// 定义一个副作用函数
const effect = fn => {
	activeEffect = fn;
	fn(); // 执行副作用函数
};

// 测试代码
const data = { text: 'hello', count: 0 };

const obj = new Proxy(data, {
	// 拦截对象属性的读取
	get(target, key) {
		console.log(`get ${key}`);
		track(target, key);
		return target[key];
	},
	set(target, key, value) {
		console.log(`set ${key}=${value}`);
		target[key] = value;
		trigger(target, key);
		return true;
	},
});

// 定义一个副作用函数，用于打印 text 的值
effect(() => {
	console.log('text:', obj.text);
});

// 定义一个副作用函数，用于打印 count 的值
effect(() => {
	console.log('count:', obj.count);
});

// 修改 text 的值，应该触发第一个副作用函数
obj.text = 'world';
// 修改 count 的值，应该触发第二个副作用函数
obj.count = 1;
