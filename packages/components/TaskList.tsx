import { TaskList as TaskListType } from '@app/state/types';
import React, {
  FunctionComponent,
  useMemo,
  useReducer,
  Dispatch,
  useCallback,
} from 'react';
import { Editor, RenderNodeProps, getEventTransfer } from 'slate-react';
import { Editor as CoreEditor, KeyUtils, Value } from 'slate';
// @ts-ignore
import { createElement } from 'react-native-web';
import { Text, View, ViewStyle, StyleProp } from 'react-native';
import { Overwrite } from 'utility-types';
import throttle from 'lodash.throttle';
import { isHotkey } from 'is-hotkey';
import useAppContext from '@app/hooks/useAppContext';
import useAppState from '@app/hooks/useAppState';
import useScreenSize from '@app/hooks/useScreenSize';

type TaskType = TaskListType['slate']['document']['nodes'][0];
type TaskTypeTypeProp = TaskType['type'];
type TaskTypeData = TaskType['data'];
// Slate key is an implementation detail. It does not belong to TaskData
// unless we will generate guids somehow.
type TaskTypeDataWithKey = { key: string } & TaskTypeData;
type TaskNode = RenderNodeProps['node'];

type Action =
  | { type: 'update'; value: Value }
  | { type: 'toggle'; tasks: TaskTypeDataWithKey[] }
  | {
      type: 'moveHorizontal';
      tasks: TaskTypeDataWithKey[];
      forward: boolean;
    }
  | { type: 'moveVertical'; task: TaskTypeDataWithKey; forward: boolean }
  | { type: 'archive' }
  | { type: 'insertText'; text: string };

const taskTypeTypeProp: TaskTypeTypeProp = 'task';

type CheckboxProps = Overwrite<
  React.InputHTMLAttributes<HTMLInputElement>,
  { style: StyleProp<ViewStyle> }
>;

// TODO: Use custom checkbox.
const Checkbox = (props: CheckboxProps) =>
  createElement('input', { ...props, type: 'checkbox' });

// data.toJS is costly and we don't need it anyway.
// This is simple type safe approach.
const getTaskData = (node: TaskNode): TaskTypeData => {
  const completed = 'completed';
  const depth = 'depth';
  return {
    [completed]: node.data.get(completed),
    [depth]: node.data.get(depth),
  };
};

const nodeToTaskDataWithKey = (node: TaskNode): TaskTypeDataWithKey => ({
  key: node.key,
  ...getTaskData(node),
});

const Uneditable: FunctionComponent = props => {
  return (
    <>
      <div contentEditable={false}>{props.children}</div>
      {/* 
        To fix errror: "IndexSizeError: Failed to execute 'getRangeAt'
        on 'Selection': 0 is not a valid index." and some others.
      */}
      <style jsx>{`
        div {
          user-select: none;
        }
      `}</style>
    </>
  );
};

interface TaskProps extends RenderNodeProps {
  dispatch: Dispatch<Action>;
}

const TaskItem: FunctionComponent<TaskProps> = props => {
  const { theme } = useAppContext();
  const data = getTaskData(props.node);
  // https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render
  const getTaskDepthStyle = () => {
    // prettier-ignore
    switch (data.depth) {
      case 0: return theme.taskDepth0;
      case 1: return theme.taskDepth1;
      case 2: return theme.taskDepth2;
      case 3: return theme.taskDepth3;
      case 4: return theme.taskDepth4;
      case 5: return theme.taskDepth5;
      case 6: return theme.taskDepth6;
      case 7: return theme.taskDepth7;
      case 8: return theme.taskDepth8;
      case 9: return theme.taskDepth9;
      default: return data.depth < 0 ? theme.taskDepth0 : theme.taskDepth9;
    }
  };
  const depthStyle = getTaskDepthStyle();

  const handleCheckboxChange = useCallback(() => {
    props.dispatch({
      type: 'toggle',
      tasks: [nodeToTaskDataWithKey(props.node)],
    });
  }, [props]);

  const hideCheckbox =
    !props.isFocused && !data.completed && props.node.text.length === 0;

  return (
    <View {...props.attributes} style={[theme.task, depthStyle]}>
      <View style={theme.taskCheckboxWrapper}>
        <Uneditable>
          <Checkbox
            style={[
              theme.taskCheckbox,
              data.completed && theme.taskCheckboxCompleted,
              hideCheckbox && theme.opacity0,
            ]}
            checked={data.completed}
            onChange={handleCheckboxChange}
          />
        </Uneditable>
      </View>
      <Text style={[theme.text, data.completed && theme.lineThrough]}>
        {props.children}
      </Text>
    </View>
  );
};

interface TaskListProps {
  taskList: TaskListType;
}

// TaskList holds Slate editor state, because of immutable.js, we can not
// serialize and deserialize whole editor state on every key stroke.
// Therefore, editor state is browser tab specific aka not live updated.
// TODO: Once Slate will switch to plain objects, move state to local storage.
const TaskList: FunctionComponent<TaskListProps> = ({ taskList }) => {
  const editorRef = React.useRef<Editor>(null);

  const getEditor = () => {
    const { current } = editorRef;
    if (current == null) throw new Error('editorRef current is null');
    return current;
  };

  const getSelectedTasks = (): TaskTypeDataWithKey[] => {
    const selectedTasks: TaskTypeDataWithKey[] = [];
    const editor = getEditor();
    editor.value.blocks.forEach(node => {
      if (node == null || node.type !== taskTypeTypeProp) return;
      selectedTasks.push(nodeToTaskDataWithKey(node));
    });
    return selectedTasks;
  };

  const getTaskIndex = (key: string): number => {
    const editor = getEditor();
    return editor.value.document.nodes.findIndex(
      node => node != null && node.key === key,
    );
  };

  const tasksWithChildren = (tasks: TaskTypeDataWithKey[]) => {
    // Dedupe via Map.
    const map: Map<string, TaskTypeDataWithKey> = new Map();
    tasks.forEach(task => map.set(task.key, task));

    const getTaskChildren = (
      task: TaskTypeDataWithKey,
    ): TaskTypeDataWithKey[] => {
      const editor = getEditor();
      const children: TaskTypeDataWithKey[] = [];
      const { nodes } = editor.value.document;
      let index = getTaskIndex(task.key);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        index++;
        const next = nodes.get(index);
        if (next == null) break;
        const data = getTaskData(next);
        if (data.depth <= task.depth) break;
        children.push({ ...data, key: next.key });
      }
      return children;
    };

    tasks.forEach(task => {
      getTaskChildren(task).forEach(child => {
        if (map.has(child.key)) return;
        map.set(child.key, child);
      });
    });

    return [...map.values()];
  };

  const setNodesData = (tasks: TaskTypeDataWithKey[]) => {
    const editor = getEditor();
    tasks.forEach(task => {
      const { key, ...data } = task;
      editor.setNodeByKey(
        key,
        // @ts-ignore Probably wrong type definition.
        { data },
      );
    });
  };

  const toggleTasks = (tasks: TaskTypeDataWithKey[]) => {
    tasks = tasksWithChildren(tasks);
    const allCompleted = !tasks.some(task => !task.completed);
    const completedTasks = tasks.map(task => ({
      ...task,
      completed: !allCompleted,
    }));
    setNodesData(completedTasks);
  };

  const canShiftTab = (tasks: TaskTypeDataWithKey[]) =>
    !tasks.some(task => task.depth === 0);

  const moveHorizontal = (tasks: TaskTypeDataWithKey[], forward: boolean) => {
    const editor = getEditor();
    const firstTask = tasks[0];
    tasks = tasksWithChildren(tasks);
    const canTab = () => {
      const taskIndex = getTaskIndex(firstTask.key);
      if (taskIndex === 0) return false;
      const previous = editor.value.document.nodes.get(taskIndex - 1);
      if (previous == null) return false;
      const previousDepth = getTaskData(previous).depth;
      const firstDepth = tasks[0].depth;
      return firstDepth <= previousDepth;
    };
    const canChangeDepth = forward ? canTab() : canShiftTab(tasks);
    if (!canChangeDepth) return;
    const changedTasks = tasks.map(task => ({
      ...task,
      depth: task.depth + (forward ? 1 : -1),
    }));
    setNodesData(changedTasks);
  };

  const moveVertical = (task: TaskTypeDataWithKey, forward: boolean) => {
    const editor = getEditor();
    const { nodes } = editor.value.document;
    let index = getTaskIndex(task.key);
    if (index === 0 && !forward) return;
    let siblingData = null;
    while (forward ? index < nodes.count() : index > 0) {
      index += forward ? 1 : -1;
      const sibling = nodes.get(index);
      if (sibling == null) return;
      siblingData = getTaskData(sibling);
      if (siblingData.depth <= task.depth) break;
    }
    let tasks = tasksWithChildren([task]);
    const depthChanged = siblingData && siblingData.depth < task.depth;
    tasks = tasks.map(task => {
      return {
        ...task,
        depth: Math.max(task.depth - (depthChanged ? 1 : 0), 0),
      };
    });
    if (forward) {
      const task = nodeToTaskDataWithKey(nodes.get(index));
      index += tasksWithChildren([task]).length - 1;
      tasks.reverse().forEach((task, i) => {
        setNodesData([task]);
        editor.moveNodeByKey(task.key, editor.value.document.key, index - i);
      });
    } else {
      tasks.forEach((task, i) => {
        setNodesData([task]);
        editor.moveNodeByKey(task.key, editor.value.document.key, index + i);
      });
    }
  };

  // Reducer here is ok.
  // https://twitter.com/dan_abramov/status/1102010979611746304
  const editorValueReducer = (state: Value, action: Action) => {
    const assertNever = (action: never): never => {
      throw new Error(`Unexpected action: ${JSON.stringify(action)}`);
    };
    switch (action.type) {
      case 'update':
        return action.value;
      case 'toggle': {
        toggleTasks(action.tasks);
        return state;
      }
      case 'moveHorizontal': {
        moveHorizontal(action.tasks, action.forward);
        return state;
      }
      case 'moveVertical': {
        moveVertical(action.task, action.forward);
        return state;
      }
      case 'archive': {
        return state;
      }
      case 'insertText': {
        getEditor().insertText(action.text);
        return state;
      }
      default:
        return assertNever(action);
    }
  };

  const initReducer = (taskListSlate: TaskListType['slate']) => {
    KeyUtils.resetGenerator(); // For SSR.
    return Value.fromJSON(taskListSlate);
  };

  const [editorValue, dispatch] = useReducer(
    editorValueReducer,
    taskList.slate,
    initReducer,
  );

  const renderNode = useCallback(
    (props: RenderNodeProps, _editor: CoreEditor, next: () => any) => {
      switch (props.node.type) {
        case taskTypeTypeProp:
          return <TaskItem {...props} dispatch={dispatch} />;
        default:
          return next();
      }
    },
    [],
  );

  const setAppState = useAppState();
  const taskListId = taskList.id;

  const saveThrottled = useMemo(() => {
    return throttle((value: Value) => {
      setAppState(state => {
        const index = state.taskLists.findIndex(t => t.id === taskListId);
        if (index === -1) return;
        state.taskLists[index].slate = value.toJSON() as TaskListType['slate'];
      });
    }, 1000);
  }, [setAppState, taskListId]);

  // editorValue.document, so we don't save on selection change.
  const handleEditorChange = useCallback(
    ({ value }: { value: Value }) => {
      dispatch({ type: 'update', value });
      const documentHasBeenChanged = value.document !== editorValue.document;
      if (!documentHasBeenChanged) return;
      saveThrottled(value);
    },
    [editorValue.document, saveThrottled],
  );

  const handleEditorKeyDown = (
    event: KeyboardEvent,
    _editor: CoreEditor,
    next: () => any,
  ) => {
    const isAltEnter = isHotkey('alt+enter')(event);
    if (isAltEnter) {
      event.preventDefault();
      dispatch({ type: 'toggle', tasks: getSelectedTasks() });
      return;
    }

    const isTab = isHotkey('tab')(event);
    const isShiftTab = isHotkey('shift+tab')(event);
    if (isTab || isShiftTab) {
      const tasks = getSelectedTasks();
      // For keyboard navigation UX, shift-tab to leave TaskList.
      if (isShiftTab && !canShiftTab(tasks)) return;
      event.preventDefault();
      dispatch({
        type: 'moveHorizontal',
        tasks,
        forward: isTab,
      });
      return;
    }

    const isMetaUp = isHotkey('meta+up')(event);
    const isMetaDown = isHotkey('meta+down')(event);
    if (isMetaUp || isMetaDown) {
      const tasks = getSelectedTasks();
      // We know how to vertically move only just one task.
      if (tasks.length === 1) {
        event.preventDefault();
        dispatch({
          type: 'moveVertical',
          task: tasks[0],
          forward: isMetaDown,
        });
        return;
      }
    }

    const isEnter = isHotkey('enter')(event);
    if (isEnter) {
      event.preventDefault();
      const editor = getEditor();
      const taskHasText = editor.value.blocks.get(0).text.length > 0;
      const tasks = getSelectedTasks();
      if (!taskHasText && canShiftTab(tasks)) {
        dispatch({
          type: 'moveHorizontal',
          tasks,
          forward: false,
        });
        return;
      }
    }

    return next();
  };

  const handleEditorPaste = (event: ClipboardEvent) => {
    // Prevent default so the DOM state isn't corrupted.
    event.preventDefault();
    // Wrong type definition.
    const transfer: any = getEventTransfer(event);
    const text =
      transfer.type === 'text' || transfer.type === 'html'
        ? transfer.text
        : transfer.type === 'fragment'
        ? transfer.fragment.getText()
        : '';
    if (!text) return;
    dispatch({ type: 'insertText', text });
  };

  const screenSize = useScreenSize();

  return (
    <Editor
      autoFocus={!screenSize.phoneOnly}
      autoCorrect={false}
      spellCheck={false}
      renderNode={renderNode}
      onChange={handleEditorChange}
      // @ts-ignore
      onKeyDown={handleEditorKeyDown}
      // @ts-ignore
      onPaste={handleEditorPaste}
      ref={editorRef}
      value={editorValue}
    />
  );
};

export default TaskList;
