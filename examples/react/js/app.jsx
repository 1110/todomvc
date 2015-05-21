/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router*/
var app = app || {};

(function () {
	'use strict';

	app.ALL_TODOS = 'all';
	app.ACTIVE_TODOS = 'active';
	app.COMPLETED_TODOS = 'completed';
	var TodoFooter = app.TodoFooter;
	var TodoItem = app.TodoItem;

	var ENTER_KEY = 13;

	/*
	 * TodoApp 标签
	 */
	var TodoApp = React.createClass({

		/*
		 * 初始化
		 */
		getInitialState: function () {
			return {
				/* 默认显示所有todo */
				nowShowing: app.ALL_TODOS,
				editing: null
			};
		},

		/*
		 * 在初始化渲染执行之后立刻调用一次
		 */
		componentDidMount: function () {
			var setState = this.setState;
			/* 路由规则 */
			var router = Router({
				'/': setState.bind(this, {nowShowing: app.ALL_TODOS}),
				'/active': setState.bind(this, {nowShowing: app.ACTIVE_TODOS}),
				'/completed': setState.bind(this, {nowShowing: app.COMPLETED_TODOS})
			});
			router.init('/');
		},

		/*
		 * 添加新的todo
		 */
		handleNewTodoKeyDown: function (event) {
			if (event.which !== ENTER_KEY) {
				return;
			}

			event.preventDefault();

			//获取input框的值
			var val = this.refs.newField.getDOMNode().value.trim();

			if (val) {
				this.props.model.addTodo(val);
				this.refs.newField.getDOMNode().value = '';
			}
		},

		/*
		 * 选择所有为已完成/未完成
		 */
		toggleAll: function (event) {
			var checked = event.target.checked;
			this.props.model.toggleAll(checked);
		},

		/*
		 * 标记为已完成/未完成
		 */
		toggle: function (todoToToggle) {
			this.props.model.toggle(todoToToggle);
		},

		/*
		 * 保存
		 */
		destroy: function (todo) {
			this.props.model.destroy(todo);
		},

		/*
		 * 编辑
		 */
		edit: function (todo) {
			this.setState({editing: todo.id});
		},

		/*
		 * 保存
		 */
		save: function (todoToSave, text) {
			this.props.model.save(todoToSave, text);
			this.setState({editing: null});
		},

		/*
		 * 编辑状态的取消
		 */
		cancel: function () {
			this.setState({editing: null});
		},

		/*
		 * 清除已经完成的todo
		 */
		clearCompleted: function () {
			this.props.model.clearCompleted();
		},

		render: function () {
			var footer;
			var main;

			//读取本地缓存的todo数据
			var todos = this.props.model.todos;

			var shownTodos = todos.filter(function (todo) {
				switch (this.state.nowShowing) {
				case app.ACTIVE_TODOS:
					return !todo.completed;
				case app.COMPLETED_TODOS:
					return todo.completed;
				default:
					return true;
				}
			}, this);

			/*
			 * todo 列表, 调用todoitem.jsx
			 */
			var todoItems = shownTodos.map(function (todo) {
				return (
					<TodoItem
						key={todo.id}
						todo={todo}
						onToggle={this.toggle.bind(this, todo)}
						onDestroy={this.destroy.bind(this, todo)}
						onEdit={this.edit.bind(this, todo)}
						editing={this.state.editing === todo.id}
						onSave={this.save.bind(this, todo)}
						onCancel={this.cancel}
					/>
				);
			}, this);

			/*
			 * 激活的 todo 数量
			 */ 
			var activeTodoCount = todos.reduce(function (accum, todo) {
				return todo.completed ? accum : accum + 1;
			}, 0);

			/*
			 * 已经完成的todo 数量
			 */
			var completedCount = todos.length - activeTodoCount;

			if (activeTodoCount || completedCount) {
				footer =
					<TodoFooter
						count={activeTodoCount}
						completedCount={completedCount}
						nowShowing={this.state.nowShowing}
						onClearCompleted={this.clearCompleted}
					/>;
			}

			/*
			 * todo 列表，有todo数据的时候才出现
			 * 带有全选为已完成
			 */
			if (todos.length) {
				main = (
					<section id="main">
						<input
							id="toggle-all"
							type="checkbox"
							onChange={this.toggleAll}
							checked={activeTodoCount === 0}
						/>
						<ul id="todo-list">
							{todoItems}
						</ul>
					</section>
				);
			}

			/*
			 * TodoApp 页面实现
			 */
			return (
				<div>
					<header id="header">
						<h1>todos</h1>
						<input
							ref="newField"
							id="new-todo"
							placeholder="What needs to be done?"
							onKeyDown={this.handleNewTodoKeyDown}
							autoFocus={true}
						/>
					</header>
					{main}
					{footer}
				</div>
			);
		}
	});

	/*
	 * model
	 */
	var model = new app.TodoModel('react-todos');

	/*
	 * 首页渲染
	 */
	function render() {
		React.render(
			<TodoApp model={model}/>,
			document.getElementById('todoapp')
		);
	}

	/*
	 * 订阅事件
	 */
	model.subscribe(render);
	render();
})();
